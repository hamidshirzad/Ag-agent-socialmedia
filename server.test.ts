/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Mock Firebase Admin so Firestore calls don't hit the network
vi.mock("firebase-admin/firestore", () => {
  const mockAdd = vi.fn().mockResolvedValue({ id: "mock-doc-id" });
  const mockWhere = vi.fn().mockReturnThis();
  const mockGet = vi.fn().mockResolvedValue({ empty: true, docs: [] });
  const mockCollection = vi.fn(() => ({ add: mockAdd, where: mockWhere, get: mockGet }));
  return {
    getFirestore: vi.fn(() => ({ collection: mockCollection })),
  };
});

vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
  },
}));

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
