import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { generateContentWithEngine, AIConfig } from "./src/services/aiService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  });

  return app;
}

async function startServer() {
  const REQUIRED_ENV = ["PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID"];
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
