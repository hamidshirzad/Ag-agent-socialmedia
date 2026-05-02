import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import crypto from "crypto";
import cors from "cors";
import rateLimit from "express-rate-limit";

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

// ─── PKCE helpers ────────────────────────────────────────────────────────────
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ─── OAuth state store ────────────────────────────────────────────────────────
// Keyed by a random state token (NOT userId) so an attacker cannot predict or
// forge state values for another user's session.
const oauthStateStore = new Map<string, { userId: string; pkceVerifier?: string; expiry: number }>();

// Purge expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore) {
    if (value.expiry < now) oauthStateStore.delete(key);
  }
}, 10 * 60 * 1000);

// ─── PayPal plan ID → plan name mapping ──────────────────────────────────────
const PAYPAL_PLAN_MAP: Record<string, "starter" | "pro" | "agency"> = {};
if (process.env.VITE_PAYPAL_PLAN_ID_STARTER) PAYPAL_PLAN_MAP[process.env.VITE_PAYPAL_PLAN_ID_STARTER] = "starter";
if (process.env.VITE_PAYPAL_PLAN_ID_PRO) PAYPAL_PLAN_MAP[process.env.VITE_PAYPAL_PLAN_ID_PRO] = "pro";
if (process.env.VITE_PAYPAL_PLAN_ID_AGENCY) PAYPAL_PLAN_MAP[process.env.VITE_PAYPAL_PLAN_ID_AGENCY] = "agency";

// ─── Security helpers ─────────────────────────────────────────────────────────

// Verify PayPal webhook signature via PayPal's verification API.
// Returns true when verification is skipped (unconfigured) or passes.
async function verifyPayPalWebhook(
  headers: Record<string, string | string[] | undefined>,
  body: unknown
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId || !process.env.VITE_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return true; // Verification skipped in dev/test when env vars are absent
  }
  try {
    const baseUrl = process.env.PAYPAL_ENV === "production"
      ? "https://api.paypal.com"
      : "https://api.sandbox.paypal.com";

    const tokenRes = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: process.env.VITE_PAYPAL_CLIENT_ID, password: process.env.PAYPAL_CLIENT_SECRET },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const verifyRes = await axios.post(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: body,
      },
      { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
    );

    return verifyRes.data.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[PayPal] Signature verification error:", err);
    return false;
  }
}

// Verify a Firebase ID token from the Authorization: Bearer <token> header.
// Returns the uid on success, null otherwise.
async function verifyFirebaseToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.split(" ")[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────
export function createApp() {
  const app = express();

  // CORS — only allow the configured app origin
  const allowedOrigin = process.env.APP_URL || "http://localhost:3000";
  app.use(cors({ origin: allowedOrigin, credentials: true }));

  app.use(express.json());

  // Rate limiting — tighter on auth endpoints, standard on API
  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
  app.use("/api/", apiLimiter);
  app.use("/auth/", authLimiter);

  // Health
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── OAuth URL construction ────────────────────────────────────────────────
  app.get("/api/auth/url/:platform", (req, res) => {
    const { platform } = req.params;
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/auth/callback/${platform}`;

    // Use a random, opaque state token — NOT the userId — to prevent state forgery.
    const stateToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 10 * 60 * 1000; // 10 min TTL

    let authUrl = "";

    switch (platform) {
      case "linkedin":
        oauthStateStore.set(stateToken, { userId: userId as string, expiry });
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}&scope=openid%20profile%20email%20w_member_social`;
        break;
      case "meta":
        oauthStateStore.set(stateToken, { userId: userId as string, expiry });
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts`;
        break;
      case "x": {
        const pkceVerifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(pkceVerifier);
        oauthStateStore.set(stateToken, { userId: userId as string, pkceVerifier, expiry });
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.VITE_X_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}&scope=tweet.read%20tweet.write%20users.read%20offline.access&code_challenge=${challenge}&code_challenge_method=S256`;
        break;
      }
      case "tiktok":
        oauthStateStore.set(stateToken, { userId: userId as string, expiry });
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.VITE_TIKTOK_CLIENT_ID}&scope=user.info.basic,video.list,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}`;
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    res.json({ url: authUrl });
  });

  // ─── OAuth callback ────────────────────────────────────────────────────────
  app.get(["/auth/callback/:platform", "/auth/callback/:platform/"], async (req, res) => {
    const { platform } = req.params;
    const { code, state: stateToken } = req.query;

    if (!code || !stateToken) {
      return res.status(400).send("Missing code or state");
    }

    // Validate state token and retrieve the userId
    const stateData = oauthStateStore.get(stateToken as string);
    if (!stateData || stateData.expiry < Date.now()) {
      oauthStateStore.delete(stateToken as string);
      return res.status(400).send("Invalid or expired OAuth state");
    }
    oauthStateStore.delete(stateToken as string);
    const userId = stateData.userId;

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/auth/callback/${platform}`;

    try {
      let accessToken = "";
      let username = "User";
      let avatarUrl = "";

      if (platform === "linkedin") {
        const response = await axios.post(
          "https://www.linkedin.com/oauth/v2/accessToken",
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
        const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        username = profileRes.data.name || "LinkedIn User";
        avatarUrl = profileRes.data.picture || "";

      } else if (platform === "meta") {
        const response = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
          params: {
            client_id: process.env.VITE_FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: redirectUri,
            code,
          },
        });
        accessToken = response.data.access_token;
        const profileRes = await axios.get(`https://graph.facebook.com/me?fields=name,picture&access_token=${accessToken}`);
        username = profileRes.data.name || "Facebook User";
        avatarUrl = profileRes.data.picture?.data?.url || "";

      } else if (platform === "x") {
        const response = await axios.post(
          "https://api.twitter.com/2/oauth2/token",
          new URLSearchParams({
            code: code as string,
            grant_type: "authorization_code",
            client_id: process.env.VITE_X_CLIENT_ID!,
            redirect_uri: redirectUri,
            code_verifier: stateData.pkceVerifier ?? "",
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${process.env.VITE_X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
            },
          }
        );
        accessToken = response.data.access_token;
        const profileRes = await axios.get("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        username = profileRes.data.data.username || "X User";
        avatarUrl = profileRes.data.data.profile_image_url || "";

      } else if (platform === "tiktok") {
        const response = await axios.post(
          "https://open.tiktokapis.com/v2/oauth/token/",
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
        const profileRes = await axios.get(
          "https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        username = profileRes.data.data.user.display_name || "TikTok User";
        avatarUrl = profileRes.data.data.user.avatar_url || "";
      }

      // Update Firestore via Admin SDK (bypasses client rules, verifies server intent)
      const userRef = targetDb.collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const currentAccounts = userDoc.data()?.socialAccounts || [];
        const newAccount = {
          platform,
          accessToken,
          username,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}`,
          autoReply: true,
          agentEngagement: true,
          connectedAt: new Date().toISOString(),
        };
        await userRef.update({
          socialAccounts: [...currentAccounts.filter((a: any) => a.platform !== platform), newAccount],
        });
      }

      // Send success message to opener using specific origin (not wildcard)
      const safeAppUrl = JSON.stringify(appUrl);
      res.send(`
        <html>
          <body style="background:#111;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;">
              <h2 style="color:#FFB800;">Neural Link Established</h2>
              <p>Synchronizing ${platform} relay… this window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platform}' }, ${safeAppUrl});
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
      res.status(500).send("Authentication failed");
    }
  });

  // ─── PayPal Webhook ────────────────────────────────────────────────────────
  app.post("/api/billing/webhook", async (req, res) => {
    // Verify PayPal signature before trusting any event data
    const isValid = await verifyPayPalWebhook(req.headers as Record<string, string>, req.body);
    if (!isValid) {
      console.warn("[PayPal] Rejected webhook — invalid signature");
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook] ${eventType} received:`, event.id);

    try {
      const findUserBySubscriptionId = async (subscriptionId: string) => {
        const snap = await targetDb.collection("users").where("paypalSubscriptionId", "==", subscriptionId).limit(1).get();
        return snap.empty ? null : snap.docs[0];
      };

      const findUserByEmail = async (email: string) => {
        const snap = await targetDb.collection("users").where("email", "==", email).limit(1).get();
        return snap.empty ? null : snap.docs[0];
      };

      switch (eventType) {
        case "BILLING.SUBSCRIPTION.ACTIVATED": {
          const plan = PAYPAL_PLAN_MAP[resource.plan_id] ?? "starter";
          let userDoc = await findUserBySubscriptionId(resource.id);
          if (!userDoc && resource.subscriber?.email_address) {
            userDoc = await findUserByEmail(resource.subscriber.email_address);
          }
          if (userDoc) {
            await userDoc.ref.update({ plan, subscriptionStatus: "active", paypalSubscriptionId: resource.id });
            console.log(`[PayPal] Activated ${plan} for user ${userDoc.id}`);
          }
          break;
        }
        case "BILLING.SUBSCRIPTION.CANCELLED": {
          const userDoc = await findUserBySubscriptionId(resource.id);
          if (userDoc) {
            await userDoc.ref.update({ plan: "starter", subscriptionStatus: "cancelled" });
          }
          break;
        }
        case "BILLING.SUBSCRIPTION.SUSPENDED": {
          const userDoc = await findUserBySubscriptionId(resource.id);
          if (userDoc) await userDoc.ref.update({ subscriptionStatus: "suspended" });
          break;
        }
        case "PAYMENT.SALE.COMPLETED":
          console.log(`[PayPal] Sale completed: ${resource.amount?.total} ${resource.amount?.currency}`);
          break;
        default:
          console.log(`[PayPal] Unhandled event: ${eventType}`);
      }

      res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Processing Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // ─── Schedule Post ─────────────────────────────────────────────────────────
  app.post("/api/schedule-post", async (req, res) => {
    // Require a valid Firebase ID token — the userId in the body must match
    const authenticatedUid = await verifyFirebaseToken(req.headers.authorization);
    if (!authenticatedUid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId, postId, platforms, scheduledAt, caption, mediaUrl, campaignId, type } = req.body;

    if (!userId || !platforms || !scheduledAt) {
      return res.status(400).json({ error: "userId, platforms, and scheduledAt are required" });
    }
    if (userId !== authenticatedUid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const postData = {
        userId,
        platforms: Array.isArray(platforms) ? platforms : [platforms],
        scheduledAt,
        caption: caption ?? "",
        type: type ?? "text",
        status: "scheduled",
        createdAt: new Date().toISOString(),
        ...(mediaUrl && { mediaUrl }),
        ...(campaignId && { campaignId }),
      };

      let docId: string;
      if (postId) {
        await targetDb.collection("posts").doc(postId).set(postData, { merge: true });
        docId = postId;
      } else {
        const docRef = await targetDb.collection("posts").add(postData);
        docId = docRef.id;
      }

      res.json({ success: true, id: docId });
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

// ─── Server startup ────────────────────────────────────────────────────────────
async function startServer() {
  const app = createApp();
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.argv[1] === __filename) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
