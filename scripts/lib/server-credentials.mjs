/**
 * Which environment variables are server-owned.
 *
 * Derived from `.env.example` rather than hardcoded, so a secret added there in
 * future is protected automatically. A hardcoded floor is unioned in, so the
 * guard still protects the known set if `.env.example` is moved or trimmed.
 *
 * Classification rule: every variable in `.env.example` WITHOUT the `VITE_`
 * prefix is server-owned, except the documented public values below. The
 * `VITE_` prefix is Vite's marker for "safe to publish", so anything carrying
 * it is public client configuration by definition — including
 * VITE_FIREBASE_API_KEY and the OAuth client IDs, which are published by design
 * and are NOT the same thing as the matching *_CLIENT_SECRET.
 */

import { readFileSync } from "node:fs";

/**
 * Non-VITE_ variables that are nonetheless not secrets. Each needs a reason:
 * exposing it must be harmless.
 */
const PUBLIC_NON_VITE = new Set([
  "APP_URL", // the app's own public URL
  "NODE_ENV", // build mode
  "PAYPAL_PLAN_ID_STARTER", // plan identifiers appear in checkout flows
  "PAYPAL_PLAN_ID_PRO",
  "PAYPAL_PLAN_ID_AGENCY",
  "VITE_APP_URL",
  "VITE_API_URL",
]);

/**
 * The minimum protected set, independent of `.env.example`. Includes
 * credentials consumed by server.ts and ones used by code paths that have come
 * and gone (FIREBASE_SERVICE_ACCOUNT, DATABASE_URL) so they cannot regress.
 */
export const REQUIRED_FLOOR = [
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "LINKEDIN_CLIENT_SECRET",
  "FACEBOOK_CLIENT_SECRET",
  "X_CLIENT_SECRET",
  "TIKTOK_CLIENT_SECRET",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_WEBHOOK_ID",
  "FIREBASE_SERVICE_ACCOUNT",
  "DATABASE_URL",
];

/** Variable names declared in a dotenv-style file. */
export function parseEnvExampleNames(text) {
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) names.push(match[1]);
  }
  return names;
}

/** Server-owned names: the floor, plus every non-public non-VITE_ declaration. */
export function deriveServerCredentials(envExampleText = "") {
  const derived = parseEnvExampleNames(envExampleText).filter(
    (name) => !name.startsWith("VITE_") && !PUBLIC_NON_VITE.has(name),
  );
  return [...new Set([...REQUIRED_FLOOR, ...derived])].sort();
}

export function readServerCredentials(envExamplePath) {
  let text = "";
  try {
    text = readFileSync(envExamplePath, "utf8");
  } catch {
    // Absent .env.example falls back to the floor.
  }
  return deriveServerCredentials(text);
}

export { PUBLIC_NON_VITE };
