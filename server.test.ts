/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Firestore is stubbed so the API tests never touch a live project.
const { firestoreMock, billingEventsAdd } = vi.hoisted(() => {
  const billingEventsAdd = vi.fn().mockResolvedValue({ id: "billing_event_1" });
  const firestoreMock = {
    collection: vi.fn(() => ({
      add: billingEventsAdd,
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ exists: false, data: () => undefined }),
        update: vi.fn().mockResolvedValue(undefined),
      })),
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
      })),
    })),
  };
  return { firestoreMock, billingEventsAdd };
});

vi.mock("firebase-admin", () => ({
  default: { apps: [], initializeApp: vi.fn() },
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => firestoreMock),
}));

const { generateContentWithEngine } = vi.hoisted(() => ({
  generateContentWithEngine: vi.fn(),
}));

vi.mock("./src/services/aiService", () => ({ generateContentWithEngine }));

const { createApp } = await import("./server");

describe("Express Server API", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    billingEventsAdd.mockResolvedValue({ id: "billing_event_1" });
  });

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

  it("POST /api/billing/webhook should not write undefined fields to Firestore", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ event_type: "PAYMENT.SALE.COMPLETED" });

    expect(res.status).toBe(200);
    const logged = billingEventsAdd.mock.calls[0][0];
    for (const value of Object.values(logged)) {
      expect(value).not.toBeUndefined();
    }
  });

  it("POST /api/schedule-post should return success", async () => {
    const res = await request(app)
      .post("/api/schedule-post")
      .send({ postId: "post_1", platforms: ["linkedin"], scheduledAt: "2026-06-01" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  describe("POST /api/generate", () => {
    it("should return generated content for a valid prompt", async () => {
      generateContentWithEngine.mockResolvedValue({ linkedinPost: "Hello world" });

      const res = await request(app)
        .post("/api/generate")
        .send({ prompt: "Write a post about AI marketing" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        provider: "gemini",
        data: { linkedinPost: "Hello world" },
      });
      expect(generateContentWithEngine).toHaveBeenCalledWith(
        "Write a post about AI marketing",
        { provider: "gemini", apiKey: undefined }
      );
    });

    it("should forward the requested provider and api key", async () => {
      generateContentWithEngine.mockResolvedValue({ claude: true });

      const res = await request(app)
        .post("/api/generate")
        .send({ prompt: "test", provider: "anthropic", apiKey: "sk-test" });

      expect(res.status).toBe(200);
      expect(res.body.provider).toBe("anthropic");
      expect(generateContentWithEngine).toHaveBeenCalledWith("test", {
        provider: "anthropic",
        apiKey: "sk-test",
      });
    });

    it("should reject a missing or empty prompt", async () => {
      const missing = await request(app).post("/api/generate").send({});
      expect(missing.status).toBe(400);
      expect(missing.body.error).toBe("prompt is required");

      const blank = await request(app).post("/api/generate").send({ prompt: "   " });
      expect(blank.status).toBe(400);

      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("should reject an unsupported provider", async () => {
      const res = await request(app)
        .post("/api/generate")
        .send({ prompt: "test", provider: "llama" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Unsupported AI provider: llama");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("should return 400 when the provider key is missing", async () => {
      generateContentWithEngine.mockRejectedValue(
        new Error("Anthropic API Key missing. Please add it in Settings.")
      );

      const res = await request(app)
        .post("/api/generate")
        .send({ prompt: "test", provider: "anthropic" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Anthropic API Key missing");
    });

    it("should return 502 when the provider call fails", async () => {
      generateContentWithEngine.mockRejectedValue(new Error("upstream exploded"));

      const res = await request(app)
        .post("/api/generate")
        .send({ prompt: "test" });

      expect(res.status).toBe(502);
      expect(res.body.error).toBe("upstream exploded");
    });
  });
});
