import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // PayPal Webhook
  app.post("/api/billing/webhook", async (req, res) => {
    const event = req.body;
    console.log("PayPal Webhook Received:", event.event_type);

    try {
      // In a real production app, verify the webhook signature here using PAYPAL_WEBHOOK_ID
      // For this environment, we will process the known subscription events
      
      const subscriptionId = event.resource?.id;
      const eventType = event.event_type;

      if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
        console.log(`Subscription ${subscriptionId} activated.`);
        // Here you would find the user associated with this subscription
        // and update their status in Firestore.
      }

      res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Content Generation API (Proxied/Server-side if needed, but Gemini skill says frontend first)
  // However, things like distribution might need backend.
  app.post("/api/schedule-post", (req, res) => {
    const { postId, platforms, scheduledAt } = req.body;
    console.log(`Scheduling post ${postId} for ${platforms} at ${scheduledAt}`);
    res.json({ success: true });
  });

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
