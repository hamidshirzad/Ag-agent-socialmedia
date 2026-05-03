import express, { NextFunction, Request, Response } from "express";
import { generateContentWithEngine } from "./src/services/aiService.js";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const dbId = firebaseConfig.firestoreDatabaseId;
const targetDb = getFirestore(dbId || "(default)");

export function createApp() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OAuth URL construction
  app.get("/api/auth/url/:platform", (req, res) => {
    const { platform } = req.params;
    const { userId } = req.query;
    
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const appUrl = process.env.APP_URL || `http://localhost:3000`;
    const redirectUri = `${appUrl}/auth/callback/${platform}`;
    
    let authUrl = "";
    const state = userId as string;

    switch (platform) {
      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid%20profile%20email%20w_member_social`;
        break;
      case "meta":
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts`;
        break;
      case "x":
        // PKCE would be better but simple OAuth2 for now
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.VITE_X_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=tweet.read%20tweet.write%20users.read%20offline.access&code_challenge=challenge&code_challenge_method=plain`;
        break;
      case "tiktok":
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.VITE_TIKTOK_CLIENT_ID}&scope=user.info.basic,video.list,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    res.json({ url: authUrl });
  });

  // OAuth callback handler
  app.get(["/auth/callback/:platform", "/auth/callback/:platform/"], async (req, res) => {
    const { platform } = req.params;
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).send("Missing code or state");
    }

    const appUrl = process.env.APP_URL || `http://localhost:3000`;
    const redirectUri = `${appUrl}/auth/callback/${platform}`;

    try {
      let accessToken = "";
      let username = "User";
      let avatarUrl = "";

      // Step 1: Exchange code for tokens
      if (platform === "linkedin") {
        const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", 
          new URLSearchParams({
            grant_type: "authorization_code",
            code: code as string,
            redirect_uri: redirectUri,
            client_id: process.env.VITE_LINKEDIN_CLIENT_ID!,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        accessToken = response.data.access_token;
        
        // Fetch profile
        const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        username = profileRes.data.name || "LinkedIn User";
        avatarUrl = profileRes.data.picture || "";
      } else if (platform === "meta") {
        const response = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
          params: {
            client_id: process.env.VITE_FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: redirectUri,
            code,
          }
        });
        accessToken = response.data.access_token;
        
        const profileRes = await axios.get(`https://graph.facebook.com/me?fields=name,picture&access_token=${accessToken}`);
        username = profileRes.data.name || "Facebook User";
        avatarUrl = profileRes.data.picture?.data?.url || "";
      } else if (platform === "x") {
        const response = await axios.post("https://api.twitter.com/2/oauth2/token",
          new URLSearchParams({
            code: code as string,
            grant_type: "authorization_code",
            client_id: process.env.VITE_X_CLIENT_ID!,
            redirect_uri: redirectUri,
            code_verifier: "challenge", // matching plain challenge
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              // Use basic auth for X
              Authorization: `Basic ${Buffer.from(`${process.env.VITE_X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
            }
          }
        );
        accessToken = response.data.access_token;
        
        const profileRes = await axios.get("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        username = profileRes.data.data.username || "X User";
        avatarUrl = profileRes.data.data.profile_image_url || "";
      } else if (platform === "tiktok") {
        const response = await axios.post("https://open.tiktokapis.com/v2/oauth/token/",
          new URLSearchParams({
            client_key: process.env.VITE_TIKTOK_CLIENT_ID!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            code: code as string,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        accessToken = response.data.access_token;
        
        const profileRes = await axios.get("https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        username = profileRes.data.data.user.display_name || "TikTok User";
        avatarUrl = profileRes.data.data.user.avatar_url || "";
      }

      // Step 2: Update Firestore
      const userRef = targetDb.collection("users").doc(userId as string);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentAccounts = userData?.socialAccounts || [];
        const newAccount = {
          platform,
          accessToken,
          username,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}`,
          autoReply: true,
          agentEngagement: true,
          connectedAt: new Date().toISOString()
        };
        const updatedAccounts = [...currentAccounts.filter((a: any) => a.platform !== platform), newAccount];
        await userRef.update({ socialAccounts: updatedAccounts });
      }

      // Step 3: Send success message and close
      res.send(`
        <html>
          <body style="background: #111; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #FFB800;">Neural Link Established</h2>
              <p>Synchronizing ${platform} relay... this window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platform}' }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/settings';
                }
              </script>
            </div>
          </body>
        </html>
      `);

    } catch (error: any) {
      console.error(`OAuth callback error for ${platform}:`, error.response?.data || error.message);
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  // PayPal Webhook
  app.post("/api/billing/webhook", async (req, res) => {
    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;
    
    console.log(`[PayPal Webhook] ${eventType} received:`, event.id);

    try {
      switch (eventType) {
        case "PAYMENT.AUTHORIZATION.CREATED":
          console.log(`Authorization created for amount ${resource.amount.total} ${resource.amount.currency}`);
          // Logic to capture payment or update order status in Firestore would go here
          // We'd typically use a field like 'custom_id' from the request to find the user
          break;
          
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          console.log(`Subscription ${resource.id} activated.`);
          // Update user status to 'PRO' or similar
          break;

        case "PAYMENT.SALE.COMPLETED":
          console.log(`Sale completed for ${resource.amount.total}`);
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
          console.log(`Subscription ${resource.id} cancelled.`);
          break;

        default:
          console.log(`Unhandled PayPal event type: ${eventType}`);
      }

      res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Processing Error:", error);
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

  app.post("/api/generate", async (req: Request, res: Response, next: NextFunction) => {
    const { prompt, provider = "gemini", apiKey } = req.body as {
      prompt?: string;
      provider?: string;
      apiKey?: string;
    };
    try {
      const result = await generateContentWithEngine(prompt as string, { provider, apiKey });
      res.json(result);
    } catch (err) {
      next(err);
    }
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
