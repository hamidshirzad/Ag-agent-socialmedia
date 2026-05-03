/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

const mockGenerateContent = vi.hoisted(() => vi.fn());
vi.mock("./src/services/aiService.js", () => ({
  generateContentWithEngine: mockGenerateContent,
}));

import { createApp } from "./server";

const app = createApp();

describe("Express Server API", () => {

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
    expect(res.body.postId).toBe("post_1");
    expect(res.body.platforms).toEqual(["linkedin"]);
    expect(res.body.scheduledAt).toBe("2026-06-01");
  });

  it("returns 400 when postId is missing", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ platforms: ["twitter"], scheduledAt: "2026-05-01T12:00:00Z" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/postId/);
  });

  it("returns 400 when postId is an empty string", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "   ", platforms: ["twitter"], scheduledAt: "2026-05-01T12:00:00Z" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/postId/);
  });

  it("returns 400 when platforms is an empty array", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "p1", platforms: [], scheduledAt: "2026-05-01T12:00:00Z" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/platforms/);
  });

  it("returns 400 when scheduledAt is not a valid date", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "p1", platforms: ["twitter"], scheduledAt: "not-a-date" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/scheduledAt/);
  });
});

describe("POST /api/generate", () => {
  it("returns generated JSON on success", async () => {
    mockGenerateContent.mockResolvedValue({ tiktokScript: "Hello world" });

    const res = await request(app)
      .post("/api/generate")
      .send({ prompt: "generate content", provider: "gemini", apiKey: "test-key" });

    expect(res.status).toBe(200);
    expect(res.body.tiktokScript).toBe("Hello world");
    expect(mockGenerateContent).toHaveBeenCalledWith("generate content", {
      provider: "gemini",
      apiKey: "test-key",
    });
  });

  it("defaults provider to gemini when not specified", async () => {
    mockGenerateContent.mockResolvedValue({ result: true });

    const res = await request(app)
      .post("/api/generate")
      .send({ prompt: "test" });

    expect(res.status).toBe(200);
    expect(mockGenerateContent).toHaveBeenCalledWith("test", {
      provider: "gemini",
      apiKey: undefined,
    });
  });

  it("returns 500 with error message when generation throws", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Gemini API Key missing"));

    const res = await request(app)
      .post("/api/generate")
      .send({ prompt: "test", provider: "gemini" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Gemini API Key missing");
  });
});

describe("error middleware", () => {
  it("returns 500 JSON for errors forwarded via next(err)", async () => {
    mockGenerateContent.mockRejectedValue(new Error("unexpected failure"));

    const res = await request(app)
      .post("/api/generate")
      .send({ prompt: "x" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
  });
});
