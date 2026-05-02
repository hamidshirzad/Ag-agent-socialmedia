// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mockGenerateContent = vi.hoisted(() => vi.fn());
vi.mock("./src/services/aiService.js", () => ({
  generateContentWithEngine: mockGenerateContent,
}));

import { createApp } from "./server";

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("returns 200 with status ok, a valid ISO timestamp, and a version string", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
    expect(typeof res.body.version).toBe("string");
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
  it("returns 200 with success true and echoes validated fields", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "p1", platforms: ["twitter"], scheduledAt: "2026-05-01T12:00:00Z" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.postId).toBe("p1");
    expect(res.body.platforms).toEqual(["twitter"]);
    expect(res.body.scheduledAt).toBe("2026-05-01T12:00:00Z");
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
