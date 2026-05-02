/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// vi.mock() factories are hoisted before imports, so all mock state must be
// defined inside the factory (not in outer const declarations).
vi.mock("firebase-admin", () => ({
  default: {
    apps: { length: 0 },
    initializeApp: vi.fn(),
    auth: vi.fn(() => ({
      verifyIdToken: vi.fn().mockResolvedValue({ uid: "user_1" }),
    })),
  },
}));

vi.mock("firebase-admin/firestore", () => {
  const mockGet = vi.fn().mockResolvedValue({ empty: true, docs: [] });
  const mockLimit = vi.fn(() => ({ get: mockGet }));
  const mockWhere = vi.fn(function self() {
    return { where: self, limit: mockLimit, get: mockGet };
  });
  const mockSet = vi.fn().mockResolvedValue(undefined);
  const mockAdd = vi.fn().mockResolvedValue({ id: "new-doc-id" });
  const mockDoc = vi.fn(() => ({ set: mockSet }));
  const mockCollection = vi.fn(() => ({
    where: mockWhere,
    add: mockAdd,
    doc: mockDoc,
  }));
  return {
    getFirestore: vi.fn(() => ({ collection: mockCollection })),
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

  it("POST /api/billing/webhook should return 200 for ACTIVATED", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED", resource: { id: "sub_123" } });
    expect(res.status).toBe(200);
    expect(res.text).toBe("Webhook Processed");
  });

  it("POST /api/billing/webhook should return 200 for CANCELLED", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "BILLING.SUBSCRIPTION.CANCELLED", resource: { id: "sub_456" } });
    expect(res.status).toBe(200);
    expect(res.text).toBe("Webhook Processed");
  });

  it("POST /api/schedule-post should return success with valid auth", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .set("Authorization", "Bearer valid-token")
      .send({ userId: "user_1", postId: "post_1", platforms: ["linkedin"], scheduledAt: "2026-06-01" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/schedule-post should return 401 when auth header missing", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ userId: "user_1", platforms: ["linkedin"], scheduledAt: "2026-06-01" });
    expect(res.status).toBe(401);
  });

  it("POST /api/schedule-post should return 400 when userId missing", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .set("Authorization", "Bearer valid-token")
      .send({ platforms: ["linkedin"], scheduledAt: "2026-06-01" });
    expect(res.status).toBe(400);
  });
});
