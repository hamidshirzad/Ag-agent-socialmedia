import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const defaultClaudeSystem =
  `You are Co-pilot Core — an expert brand strategy consultant and creative director for Fourdoor AI. ` +
  `Produce precise, structured marketing output for the user's business. ` +
  `Always populate every field; never return null or placeholder values.`;

const structuredOutputTool: Anthropic.Messages.Tool = {
  name: "structured_output",
  description: "Return the response as a structured JSON object.",
  input_schema: { type: "object", additionalProperties: true },
};

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
      // Log all events to Firestore for audit trail
      await targetDb.collection("billing_events").add({
        id: event.id,
        type: eventType,
        resourceId: resource.id,
        receivedAt: new Date(),
        data: resource
      });

      switch (eventType) {
        case "PAYMENT.AUTHORIZATION.CREATED":
          console.log(`Authorization created for amount ${resource.amount.total} ${resource.amount.currency}`);
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

  // Claude AI proxy — keeps the Anthropic SDK and user API key server-side only
  app.post("/api/ai/claude", async (req, res) => {
    const { userKey, messages, systemPrompt } = req.body as {
      userKey: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      systemPrompt?: string;
    };
    if (!userKey) return res.status(400).json({ error: "Anthropic API key missing." });

    try {
      const client = new Anthropic({ apiKey: userKey });

      const resp = await client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: [
            {
              type: "text",
              text: systemPrompt ?? defaultClaudeSystem,
              cache_control: { type: "ephemeral" },
            },
          ],
          tools: [structuredOutputTool],
          tool_choice: { type: "tool", name: "structured_output" },
          messages,
        },
        { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } },
      );

      const toolUse = resp.content.find((b) => b.type === "tool_use");
      if (!toolUse || toolUse.type !== "tool_use") {
        return res.status(500).json({ error: "Model did not return structured output." });
      }
      res.json(toolUse.input);
    } catch (error: any) {
      console.error("[Claude proxy]", error?.message);
      res.status(500).json({ error: error?.message ?? "Claude API call failed." });
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

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
