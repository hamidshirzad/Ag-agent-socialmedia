/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Firestore is stubbed so the suite is hermetic. Without this, importing the
// server initializes firebase-admin and the billing webhook writes a real
// document — on any machine that has credentials configured, `npm test` would
// insert rows into the production database. The recorded writes are also
// asserted below, so absent event fields cannot silently become `undefined`.
const writes: Array<Record<string, unknown>> = [];

vi.mock("firebase-admin", () => ({
  default: { apps: [] as unknown[], initializeApp: vi.fn() },
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: () => ({
      add: vi.fn(async (data: Record<string, unknown>) => {
        writes.push(data);
        return { id: "stub_doc" };
      }),
      where: () => ({ get: async () => ({ empty: true, docs: [] }) }),
      doc: () => ({ set: vi.fn(async () => undefined), update: vi.fn(async () => undefined) }),
    }),
  }),
}));

const { createApp } = await import("./server");

describe("Express Server API", () => {
  const app = createApp();

  it("GET /api/health should return ok and timestamp", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("POST /api/billing/webhook should return 200", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED", resource: { id: "sub_123" } });
    expect(res.status).toBe(200);
    expect(res.text).toBe("Webhook Processed");
  });

  it("POST /api/schedule-post should return success", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "post_1", platforms: ["linkedin"], scheduledAt: "2026-06-01" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
