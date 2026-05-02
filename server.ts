import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { generateContentWithEngine, AIConfig } from "./src/services/aiService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── TikTok OAuth: in-memory pending result store (TTL 5 min) ─────────────────
interface TikTokOAuthResult {
  userId: string;
  openId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  scope: string;
  connectedAt: string;
}
const pendingOAuthResults = new Map<string, { data: TikTokOAuthResult; createdAt: number }>();
setInterval(() => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [k, v] of pendingOAuthResults) if (v.createdAt < cutoff) pendingOAuthResults.delete(k);
}, 10 * 60 * 1000).unref();

const TIKTOK_TOKEN_URL  = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_REVOKE_URL = "https://open.tiktokapis.com/v2/oauth/revoke/";

async function tiktokPost(url: string, params: Record<string, string>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams(params).toString(),
  });
  return res.json() as Promise<Record<string, any>>;
}

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = process.env.NODE_ENV === "production" ? process.env.APP_URL : "*";
    res.header("Access-Control-Allow-Origin", origin ?? "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: "0.0.0" });
  });

  app.post("/api/generate", async (req: Request, res: Response, next: NextFunction) => {
    const { prompt, provider = "gemini", apiKey } = req.body as {
      prompt: string;
      provider?: AIConfig["provider"];
      apiKey?: string;
    };
    try {
      const result = await generateContentWithEngine(prompt, { provider, apiKey });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/billing/webhook", async (req: Request, res: Response) => {
    const event = req.body;
    console.log("PayPal Webhook Received:", event.event_type);

    try {
      const subscriptionId = event.resource?.id;
      const eventType = event.event_type;

      if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
        console.log(`Subscription ${subscriptionId} activated.`);
      }

      res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/schedule-post", (req: Request, res: Response) => {
    const { postId, platforms, scheduledAt } = req.body as {
      postId?: unknown;
      platforms?: unknown;
      scheduledAt?: unknown;
    };

    if (typeof postId !== "string" || !postId.trim()) {
      return res.status(400).json({ error: "postId must be a non-empty string" });
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ error: "platforms must be a non-empty array" });
    }
    if (typeof scheduledAt !== "string" || isNaN(new Date(scheduledAt).getTime())) {
      return res.status(400).json({ error: "scheduledAt must be a valid ISO date string" });
    }

    console.log(`Scheduling post ${postId} for ${platforms} at ${scheduledAt}`);
    res.json({ success: true, postId, platforms, scheduledAt });
  });

  // ── TikTok OAuth ──────────────────────────────────────────────────────────

  // Redirect user to TikTok authorization page
  // GET /api/tiktok/oauth/start?userId=<uid>
  app.get("/api/tiktok/oauth/start", (req: Request, res: Response) => {
    const { userId } = req.query as { userId?: string };
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) return res.status(500).json({ error: "TIKTOK_CLIENT_KEY not configured" });

    const appUrl = process.env.APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const redirectUri = `${appUrl}/api/tiktok/oauth/callback`;

    const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authUrl.searchParams.set("client_key", clientKey);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "user.info.basic,video.list,video.publish");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    // state carries userId so the callback can associate tokens with the right user
    authUrl.searchParams.set("state", `${userId}:${randomUUID()}`);

    res.redirect(authUrl.toString());
  });

  // TikTok redirects here after user authorizes (or denies)
  // GET /api/tiktok/oauth/callback?code=...&state=...
  app.get("/api/tiktok/oauth/callback", async (req: Request, res: Response) => {
    const { code, state, error, error_description } = req.query as Record<string, string>;
    const appUrl = process.env.APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

    if (error) {
      const msg = encodeURIComponent(error_description ?? error);
      return res.redirect(`${appUrl}/settings?tiktok_error=${msg}`);
    }
    if (!code || !state) {
      return res.redirect(`${appUrl}/settings?tiktok_error=${encodeURIComponent("Missing code or state")}`);
    }

    const [userId] = state.split(":");
    const clientKey    = process.env.TIKTOK_CLIENT_KEY    ?? "";
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET ?? "";
    const redirectUri  = `${appUrl}/api/tiktok/oauth/callback`;

    try {
      const data = await tiktokPost(TIKTOK_TOKEN_URL, {
        client_key:    clientKey,
        client_secret: clientSecret,
        code,
        grant_type:    "authorization_code",
        redirect_uri:  redirectUri,
      });

      if (data.error) {
        const msg = encodeURIComponent(data.error_description ?? data.error);
        return res.redirect(`${appUrl}/settings?tiktok_error=${msg}`);
      }

      const resultId = randomUUID();
      pendingOAuthResults.set(resultId, {
        data: {
          userId,
          openId:           data.open_id,
          accessToken:      data.access_token,
          refreshToken:     data.refresh_token,
          expiresIn:        data.expires_in,
          refreshExpiresIn: data.refresh_expires_in,
          scope:            data.scope,
          connectedAt:      new Date().toISOString(),
        },
        createdAt: Date.now(),
      });

      res.redirect(`${appUrl}/settings?tiktok_result=${resultId}`);
    } catch (err) {
      console.error("TikTok OAuth callback error:", err);
      res.redirect(`${appUrl}/settings?tiktok_error=${encodeURIComponent("OAuth exchange failed")}`);
    }
  });

  // One-time token pickup by the frontend after the OAuth redirect
  // GET /api/tiktok/oauth/result/:id
  app.get("/api/tiktok/oauth/result/:id", (req: Request, res: Response) => {
    const entry = pendingOAuthResults.get(req.params.id);
    if (!entry || Date.now() - entry.createdAt > 5 * 60 * 1000) {
      return res.status(404).json({ error: "Result not found or expired" });
    }
    pendingOAuthResults.delete(req.params.id);
    res.json(entry.data);
  });

  // Refresh an expiring access token using the refresh token
  // POST /api/tiktok/oauth/refresh  { refreshToken: string }
  app.post("/api/tiktok/oauth/refresh", async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

    try {
      const data = await tiktokPost(TIKTOK_TOKEN_URL, {
        client_key:    process.env.TIKTOK_CLIENT_KEY    ?? "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
      });
      if (data.error) return res.status(400).json({ error: data.error_description ?? data.error });
      res.json({
        accessToken:      data.access_token,
        refreshToken:     data.refresh_token,
        expiresIn:        data.expires_in,
        refreshExpiresIn: data.refresh_expires_in,
        openId:           data.open_id,
        scope:            data.scope,
      });
    } catch (err) {
      next(err);
    }
  });

  // Revoke a user's access token (called when disconnecting TikTok)
  // POST /api/tiktok/oauth/revoke  { accessToken: string }
  app.post("/api/tiktok/oauth/revoke", async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.body as { accessToken?: string };
    if (!accessToken) return res.status(400).json({ error: "accessToken is required" });

    try {
      await tiktokPost(TIKTOK_REVOKE_URL, {
        client_key:    process.env.TIKTOK_CLIENT_KEY    ?? "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
        token:         accessToken,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  });

  return app;
}

async function startServer() {
  const REQUIRED_ENV = ["PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID", "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"];
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length && process.env.NODE_ENV === "production") {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const app = createApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
