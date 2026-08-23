import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import Stripe from "stripe";
import { generateContentWithEngine, type AIConfig } from "./src/services/aiService";
import {
  enforceUsageLimits,
  firestorePlanReader,
  firestoreUsageStore,
  requireAuth,
  type AuthedRequest,
} from "./server/api-guards";

dotenv.config();

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  return new Stripe(apiKey);
}

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

const SUPPORTED_PROVIDERS: AIConfig["provider"][] = ["gemini", "anthropic", "openai"];

/** Server-owned credential for each provider. Read here, never in client code. */
const SERVER_KEY_ENV: Record<AIConfig["provider"], string> = {
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};

/**
 * The server's own provider credential, only when explicitly enabled.
 *
 * Default OFF. Merging this PR therefore cannot begin spending the project's
 * paid quota; enabling it is a separate, deliberate act once authentication and
 * quotas are known to hold.
 */
function serverProviderKey(provider: AIConfig["provider"]): string | undefined {
  if (process.env.ALLOW_SERVER_PROVIDER_KEY !== "true") return undefined;
  return process.env[SERVER_KEY_ENV[provider]] || undefined;
}

export function createApp() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI content generation. Mirrors the client-side contract in
  // src/services/aiService.ts so prompts can be executed server-side with the
  // server's own provider credentials instead of a browser-held key.
  //
  // Gated by a verified Firebase ID token and per-plan usage limits. Both run
  // BEFORE the provider is called, so an unauthenticated or over-quota caller
  // costs an upstream request, not an upstream charge.
  app.post(
    "/api/generate",
    requireAuth((token) => admin.auth().verifyIdToken(token)),
    enforceUsageLimits({
      store: firestoreUsageStore(targetDb as any),
      getPlan: firestorePlanReader(targetDb as any),
    }),
    async (req, res) => {
      const { prompt, provider = "gemini", apiKey } = req.body || {};

      if (typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "prompt is required" });
      }
      if (!SUPPORTED_PROVIDERS.includes(provider)) {
        return res.status(400).json({ error: `Unsupported AI provider: ${provider}` });
      }
      if (apiKey !== undefined && typeof apiKey !== "string") {
        return res.status(400).json({ error: "apiKey must be a string" });
      }

      // The caller's own key wins. Falling back to the server's credential is
      // opt-in and off by default, so merging this cannot start spending the
      // project's quota until someone deliberately enables it.
      const key = apiKey ?? serverProviderKey(provider);

      try {
        const data = await generateContentWithEngine(prompt, { provider, apiKey: key });
        const uid = (req as AuthedRequest).user?.uid;
        console.log(`[/api/generate] ${provider} generation for ${uid}`);
        res.json({ success: true, provider, data });
      } catch (error: any) {
        const message = error?.message || "Content generation failed";
        // A missing credential is a caller problem; anything else is upstream.
        const status = /API Key missing/i.test(message) ? 400 : 502;
        console.error(`[/api/generate] ${provider} generation failed:`, message);
        res.status(status).json({ error: message });
      }
    },
  );

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

  // Stripe Checkout Session creation
  app.post("/api/billing/create-checkout-session", async (req, res) => {
    try {
      const { planId, userId, userEmail, successUrl, cancelUrl } = req.body;

      if (!planId) {
        return res.status(400).json({ error: "planId is required" });
      }

      const planDetails: Record<string, { name: string; amount: number; description: string }> = {
        starter: {
          name: "Starter Edition",
          amount: 2900, // $29.00
          description: "Perfect for solo operators and small brands."
        },
        pro: {
          name: "Pro Edition",
          amount: 9900, // $99.00
          description: "Advanced neural engine for growth hackers."
        },
        agency: {
          name: "Agency Edition",
          amount: 29900, // $299.00
          description: "Multi-tenant solution for high-volume firms."
        }
      };

      const selectedPlan = planDetails[planId] || planDetails.pro;
      const stripe = getStripeClient();

      if (stripe) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: selectedPlan.name,
                  description: selectedPlan.description,
                },
                unit_amount: selectedPlan.amount,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          customer_email: userEmail || undefined,
          client_reference_id: userId || undefined,
          metadata: {
            userId: userId || "",
            planId: planId,
          },
          success_url: successUrl || `${req.protocol}://${req.get("host")}/billing?success=true&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${req.protocol}://${req.get("host")}/billing?canceled=true`,
        });

        return res.json({ url: session.url, sessionId: session.id });
      } else {
        // Fallback for sandbox/demo mode when STRIPE_SECRET_KEY is not configured in env
        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
        const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 12)}`;
        const mockRedirectUrl = `${appUrl}/billing?success=true&plan=${planId}&session_id=${mockSessionId}&demo=true`;
        
        return res.json({ 
          url: mockRedirectUrl, 
          sessionId: mockSessionId,
          isDemoMode: true 
        });
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout session:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Stripe Webhook
  app.post("/api/billing/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripeClient();

    let event: any;

    try {
      if (stripe && webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      }

      console.log(`[Stripe Webhook] Received event: ${event.type}`);

      if (event.id) {
        await targetDb.collection("billing_events").add({
          id: event.id,
          type: event.type,
          receivedAt: new Date(),
          data: event.data?.object || null
        });
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId || session.client_reference_id;
          const planId = session.metadata?.planId;

          if (userId && planId) {
            const userRef = targetDb.collection("users").doc(userId);
            await userRef.update({
              plan: planId,
              subscriptionStatus: "active",
              stripeCustomerId: session.customer || null,
              stripeSubscriptionId: session.subscription || null,
              updatedAt: new Date()
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const userQuery = await targetDb.collection("users").where("stripeSubscriptionId", "==", subscription.id).get();
          if (!userQuery.empty) {
            await userQuery.docs[0].ref.update({
              subscriptionStatus: "canceled",
              plan: "free",
              updatedAt: new Date()
            });
          }
          break;
        }

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error(`Stripe webhook error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // PayPal Webhook
  app.post("/api/billing/webhook", async (req, res) => {
    const event = req.body || {};
    const eventType = event.event_type;
    const resource = event.resource || {};

    console.log(`[PayPal Webhook] ${eventType} received:`, event.id);

    try {
      // Log all events to Firestore for audit trail. Firestore rejects
      // `undefined`, so fall back to null for anything the event omits.
      await targetDb.collection("billing_events").add({
        id: event.id ?? null,
        type: eventType ?? null,
        resourceId: resource.id ?? null,
        receivedAt: new Date(),
        data: resource
      });

      switch (eventType) {
        case "PAYMENT.AUTHORIZATION.CREATED":
          console.log(`Authorization created for amount ${resource.amount?.total} ${resource.amount?.currency}`);
          // Potential logic: Trigger manual review or notification for high-value orders
          break;
        
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          console.log(`Subscription ${resource.id} activated.`);
          // Check for 'custom_id' or 'subscriber.email' to find user
          if (resource.subscriber?.email_address) {
             const userQuery = await targetDb.collection("users").where("email", "==", resource.subscriber.email_address).get();
             if (!userQuery.empty) {
               await userQuery.docs[0].ref.update({ 
                 plan: "pro", 
                 subscriptionId: resource.id,
                 updatedAt: new Date()
               });
             }
          }
          break;

        case "PAYMENT.SALE.COMPLETED":
          console.log(`Sale completed for ${resource.amount?.total}`);
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

  app.post("/api/schedule-post", (req, res) => {
    const { postId, platforms, scheduledAt } = req.body;
    console.log(`Scheduling post ${postId} for ${platforms} at ${scheduledAt}`);
    res.json({ success: true });
  });

  return app;
}

async function startServer() {
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only boot the HTTP/Vite server when this file is the process entry point.
// Importing it (e.g. from server.test.ts) must not bind a port.
const isEntryPoint = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === __filename;

if (isEntryPoint) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
