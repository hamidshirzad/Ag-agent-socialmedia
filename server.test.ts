/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Mock Firestore so tests don't require network access or credentials.
vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn(), applicationDefault: vi.fn() },
  },
}));
vi.mock("firebase-admin/firestore", () => {
  const doc = {
    ref: { update: vi.fn().mockResolvedValue(undefined) },
  };
  const query = {
    where: vi.fn(() => query),
    get: vi.fn().mockResolvedValue({ empty: false, docs: [doc] }),
  };
  const collection = {
    add: vi.fn().mockResolvedValue({ id: "mock-id" }),
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
      set: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    })),
    where: query.where,
    get: query.get,
  };
  return {
    getFirestore: vi.fn(() => ({ collection: vi.fn(() => collection) })),
  };
});

import { createApp } from "./server";

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
