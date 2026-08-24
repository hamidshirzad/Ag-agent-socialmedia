/**
 * Authentication and usage limits for the AI generation endpoint.
 *
 * `POST /api/generate` shipped with no access control of any kind. Codex
 * flagged it as P1 on PR #34: any unauthenticated caller could POST prompts in
 * a loop, and — once the server holds a provider credential — spend the
 * project's paid quota with no Fourdoor account and no plan.
 *
 * PR #37 has since removed the credential fallback from
 * src/services/aiService.ts, so the endpoint currently cannot reach a server
 * key at all. That closes the billing hole for now, but it is a side effect of
 * unrelated work, not a control: the moment anyone wires a server-side key back
 * in, the hole reopens. The controls belong here, in front of the route, and
 * they have to exist BEFORE a key is ever configured.
 *
 * Three layers, cheapest first:
 *   1. a verified Firebase ID token           — who is calling
 *   2. an in-process burst limiter            — stops hammering, no I/O
 *   3. a persisted per-plan quota             — survives restarts and instances
 *
 * Everything here takes its dependencies as arguments so the policy can be
 * tested without Firebase.
 */

import type { NextFunction, Request, Response } from "express";

// ───────────────────────────── authentication ─────────────────────────────

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

export interface AuthedRequest extends Request {
  user?: AuthenticatedUser;
}

export type VerifyIdToken = (token: string) => Promise<{ uid?: string; email?: string }>;

/** The token from an `Authorization: Bearer <token>` header, or null. */
export function bearerToken(header?: string | null): string | null {
  if (typeof header !== "string") return null;
  const match = header.match(/^Bearer[ \t]+(\S+)$/i);
  return match ? match[1] : null;
}

/**
 * Reject anything without a valid Firebase ID token.
 *
 * The failure message is deliberately identical for "no token", "malformed
 * token" and "expired token": telling a caller which one it was helps nobody
 * but an attacker enumerating tokens.
 */
export function requireAuth(verifyIdToken: VerifyIdToken) {
  return async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = bearerToken(req.get?.("authorization") ?? null);
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      const decoded = await verifyIdToken(token);
      if (!decoded || typeof decoded.uid !== "string" || decoded.uid === "") {
        throw new Error("token carried no uid");
      }
      (req as AuthedRequest).user = { uid: decoded.uid, email: decoded.email };
      return next();
    } catch {
      return res.status(401).json({ error: "Authentication required." });
    }
  };
}

// ─────────────────────────────── usage limits ──────────────────────────────

/**
 * What each plan is allowed, and over what window.
 *
 * These follow what src/pages/Billing.tsx actually sells, because a quota that
 * disagrees with the pricing page is a bug in whichever direction it points:
 *
 *   Starter  $29   "100 AI Generations / mo"    → a real product limit
 *   Pro      $99   "Unlimited AI Generations"   → no product limit
 *   Agency   $299  "Everything in Pro"          → no product limit
 *
 * `kind` records which of those two a number is, and that distinction is the
 * point. A `plan` limit is something the customer bought and can be quoted back
 * to them. A `safety` limit exists only to keep this endpoint's blast radius
 * finite on a plan sold as unlimited — it must never be described to a caller
 * as their plan's allowance, or the product contradicts its own pricing.
 *
 * Sizing the safety ceilings: the burst limiter below already caps any single
 * caller at 10/min, i.e. 14,400/day, so a daily ceiling only bites below that
 * figure. These sit meaningfully under it while staying far beyond human use.
 */
export const PLAN_GENERATION_LIMITS = {
  // No paid plan. Billing.tsx renders this state as "Free Edition" but
  // describes no allowance, so this figure is a placeholder rather than
  // something a customer was promised.
  free: { limit: 10, period: "month", kind: "plan" },
  starter: { limit: 100, period: "month", kind: "plan" },
  pro: { limit: 2_000, period: "day", kind: "safety" },
  agency: { limit: 10_000, period: "day", kind: "safety" },
} as const;

export type PlanName = keyof typeof PLAN_GENERATION_LIMITS;
export type QuotaPeriod = (typeof PLAN_GENERATION_LIMITS)[PlanName]["period"];

/**
 * An unknown or absent plan gets the smallest allowance, never the largest.
 *
 * This is the free tier rather than Starter: someone with no plan has paid for
 * nothing, and handing them a paying tier's quota is the expensive direction in
 * which to be wrong.
 */
export const DEFAULT_PLAN: PlanName = "free";

/** Per-user ceiling on requests in any 60-second window. */
export const BURST_PER_MINUTE = 10;

export function planFor(value: unknown): PlanName {
  if (typeof value !== "string") return DEFAULT_PLAN;
  const normalized = value.toLowerCase();
  return normalized in PLAN_GENERATION_LIMITS ? (normalized as PlanName) : DEFAULT_PLAN;
}

/**
 * The counter bucket a use falls in, in UTC so it cannot be reset by changing
 * timezone. A monthly allowance cannot be expressed in daily buckets, so the
 * bucket granularity follows the plan: `YYYY-MM` or `YYYY-MM-DD`.
 */
export function periodKey(period: QuotaPeriod, now: Date): string {
  return now.toISOString().slice(0, period === "month" ? 7 : 10);
}

export interface UsageStore {
  /** Atomically record one use. Returns whether it was permitted. */
  consume(uid: string, period: string, limit: number): Promise<{ allowed: boolean; used: number }>;
}

/**
 * In-process sliding-window limiter. Cheap, no I/O, and enough to stop a single
 * caller hammering the route between quota reads. It is per-instance by
 * design — the durable ceiling is the Firestore counter below.
 */
export function createBurstLimiter(
  { perMinute = BURST_PER_MINUTE, now = () => Date.now() } = {},
) {
  const hits = new Map<string, number[]>();

  return function allow(uid: string): boolean {
    const t = now();
    const cutoff = t - 60_000;
    const recent = (hits.get(uid) ?? []).filter((stamp) => stamp > cutoff);

    if (recent.length >= perMinute) {
      hits.set(uid, recent);
      return false;
    }

    recent.push(t);
    hits.set(uid, recent);

    // Bound memory: drop entries whose whole window has expired.
    if (hits.size > 10_000) {
      for (const [key, stamps] of hits) {
        if (stamps.every((stamp) => stamp <= cutoff)) hits.delete(key);
      }
    }

    return true;
  };
}

export interface UsageLimitOptions {
  store: UsageStore;
  getPlan: (uid: string) => Promise<PlanName>;
  allowBurst?: (uid: string) => boolean;
  now?: () => Date;
}

/**
 * Enforce burst and daily limits for the authenticated caller. Must run after
 * `requireAuth` — with no `req.user` it refuses rather than falling through,
 * so misordering the middleware fails closed.
 */
export function enforceUsageLimits(options: UsageLimitOptions) {
  const {
    store,
    getPlan,
    allowBurst = createBurstLimiter(),
    now = () => new Date(),
  } = options;

  return async function limit(req: Request, res: Response, next: NextFunction) {
    const user = (req as AuthedRequest).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowBurst(user.uid)) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({ error: "Too many requests. Try again in a minute." });
    }

    let plan: PlanName;
    let limits: (typeof PLAN_GENERATION_LIMITS)[PlanName];
    let allowed: boolean;
    let used: number;

    try {
      plan = await getPlan(user.uid);
      limits = PLAN_GENERATION_LIMITS[plan];
      ({ allowed, used } = await store.consume(
        user.uid,
        periodKey(limits.period, now()),
        limits.limit,
      ));
    } catch {
      // The durable counter is what keeps this endpoint's blast radius finite,
      // so a store failure must never fall through to the provider.
      //
      // It must also never propagate. Express 4 does not forward an async
      // middleware's rejection to an error handler, so an unguarded throw here
      // escapes as an unhandled rejection — which on Node's default settings
      // terminates the process. That turns any Firestore hiccup, or anything a
      // caller can do to provoke one, into a way to take the server down.
      //
      // Fail closed with a retryable 503: shedding the request is strictly
      // better than crashing, and than letting it past the quota.
      res.setHeader("Retry-After", "60");
      return res
        .status(503)
        .json({ error: "Usage service temporarily unavailable. Try again shortly." });
    }

    res.setHeader("X-Quota-Limit", String(limits.limit));
    res.setHeader("X-Quota-Used", String(Math.min(used, limits.limit)));
    res.setHeader("X-Quota-Period", limits.period);

    if (!allowed) {
      // Deliberately no Retry-After here. The burst path above knows the window
      // is 60 seconds; this one may not free up until next month, and quoting a
      // minute would be a wrong answer rather than a missing one.
      return res.status(429).json({
        error:
          limits.kind === "plan"
            ? `Generation limit reached for the ${plan} plan (${limits.limit} per ${limits.period}).`
            : "Unusual request volume for this account. Try again later.",
      });
    }

    return next();
  };
}

// ───────────────────────────── Firestore backing ───────────────────────────

/** Minimal shape used here, so this module does not depend on firebase-admin. */
interface FirestoreLike {
  collection(name: string): {
    doc(id: string): unknown;
  };
  runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}

/**
 * Durable counter, one document per user per quota period. A transaction is used
 * rather than an increment so the read and the ceiling check cannot race two
 * concurrent requests past the limit.
 */
export function firestoreUsageStore(db: FirestoreLike): UsageStore {
  return {
    async consume(uid, period, limit) {
      const ref = db.collection("usage_counters").doc(`${uid}_${period}`);

      return db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        const used = Number(snapshot?.exists ? snapshot.data()?.count ?? 0 : 0) || 0;

        if (used >= limit) return { allowed: false, used };

        tx.set(
          ref,
          { uid, period, count: used + 1, updatedAt: new Date() },
          { merge: true },
        );
        return { allowed: true, used: used + 1 };
      });
    },
  };
}

/** Read the caller's plan from `users/{uid}`, defaulting to the smallest. */
export function firestorePlanReader(db: {
  collection(name: string): { doc(id: string): { get(): Promise<any> } };
}) {
  return async function getPlan(uid: string): Promise<PlanName> {
    try {
      const snapshot = await db.collection("users").doc(uid).get();
      return planFor(snapshot?.exists ? snapshot.data()?.plan : undefined);
    } catch {
      // A lookup failure must not hand out a larger allowance than the smallest.
      return DEFAULT_PLAN;
    }
  };
}
