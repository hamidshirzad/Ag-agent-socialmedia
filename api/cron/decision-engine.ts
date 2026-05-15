import type { IncomingMessage, ServerResponse } from "http";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function initFirebase() {
  if (admin.apps.length) return;
  const configPath = path.join(__dirname, "../../firebase-applet-config.json");
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  admin.initializeApp({ projectId: cfg.projectId });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  // Fail closed: CRON_SECRET must be set and non-empty.
  // An absent or blank secret means the server is misconfigured —
  // reject rather than silently skip authentication.
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Server misconfigured: CRON_SECRET is not set" }));
  }

  // Always validate — no conditional bypass.
  const authHeader = (req.headers["authorization"] ?? "").trim();
  if (authHeader !== `Bearer ${cronSecret}`) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Unauthorized" }));
  }

  try {
    initFirebase();
    const db = getFirestore();

    const now = new Date().toISOString();
    const results: Array<{ userId: string; leadsProcessed: number }> = [];

    // Fetch all user profiles
    const usersSnap = await db.collection("users").get();

    await Promise.all(
      usersSnap.docs.map(async (userDoc) => {
        const userId = userDoc.id;

        // Fetch unscored leads for this user
        const leadsSnap = await db
          .collection("leads")
          .where("userId", "==", userId)
          .where("score", "==", 0)
          .get();

        if (leadsSnap.empty) return;

        const batch = db.batch();

        for (const leadDoc of leadsSnap.docs) {
          const lead = leadDoc.data();

          // Baseline score: 50 + recency bonus (up to +30) + message length signal (up to +20)
          const ageMs = Date.now() - new Date(lead.createdAt ?? 0).getTime();
          const recencyBonus = Math.max(0, 30 - Math.floor(ageMs / (1000 * 60 * 60 * 24)));
          const msgBonus = Math.min(20, Math.floor((lead.initialMessage?.length ?? 0) / 10));
          const score = 50 + recencyBonus + msgBonus;

          batch.update(leadDoc.ref, {
            score,
            status: score >= 70 ? "qualified" : "new",
            scoredAt: now,
          });
        }

        // Write audit log entry
        batch.set(db.collection("agent_logs").doc(), {
          userId,
          type: "decision_engine",
          leadsProcessed: leadsSnap.size,
          ranAt: now,
        });

        await batch.commit();
        results.push({ userId, leadsProcessed: leadsSnap.size });
      })
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, ranAt: now, results }));
  } catch (err) {
    console.error("decision-engine cron error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
