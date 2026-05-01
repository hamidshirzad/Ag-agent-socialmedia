// @vitest-environment node
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./server";

const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with status ok and a valid ISO timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });
});

describe("POST /api/billing/webhook", () => {
  it("processes BILLING.SUBSCRIPTION.ACTIVATED and returns 200", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED", resource: { id: "sub_123" } });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Webhook Processed");
  });

  it("returns 200 for unknown event types", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "UNKNOWN_EVENT" });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Webhook Processed");
  });

  it("returns 200 for an empty body", async () => {
    const res = await request(app).post("/api/billing/webhook").send({});

    expect(res.status).toBe(200);
  });
});

describe("POST /api/schedule-post", () => {
  it("returns 200 with success true", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "p1", platforms: ["twitter"], scheduledAt: "2026-05-01T12:00:00Z" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
