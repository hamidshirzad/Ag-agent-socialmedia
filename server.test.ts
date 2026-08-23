/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Firestore is stubbed so the API tests never touch a live project.
const { firestoreMock, billingEventsAdd, verifyIdToken, usageDocs, userPlan } = vi.hoisted(() => {
  const billingEventsAdd = vi.fn().mockResolvedValue({ id: "billing_event_1" });
  const verifyIdToken = vi.fn();

  // Quota counters, keyed by document id, so the daily limit is really counted.
  const usageDocs = new Map<string, { count: number }>();
  const userPlan = { value: "starter" as string | undefined };

  const docFor = (collection: string, id: string) => ({
    id,
    get: vi.fn().mockImplementation(async () => {
      if (collection === "users") {
        return { exists: true, data: () => ({ plan: userPlan.value }) };
      }
      const stored = usageDocs.get(id);
      return { exists: Boolean(stored), data: () => stored };
    }),
    update: vi.fn().mockResolvedValue(undefined),
  });

  const firestoreMock = {
    collection: vi.fn((name: string) => ({
      add: billingEventsAdd,
      doc: vi.fn((id: string) => docFor(name, id)),
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
      })),
    })),
    runTransaction: vi.fn(async (fn: (tx: any) => Promise<unknown>) =>
      fn({
        get: async (ref: any) => {
          const stored = usageDocs.get(ref.id);
          return { exists: Boolean(stored), data: () => stored };
        },
        set: (ref: any, value: any) => usageDocs.set(ref.id, { count: value.count }),
      }),
    ),
  };

  return { firestoreMock, billingEventsAdd, verifyIdToken, usageDocs, userPlan };
});

vi.mock("firebase-admin", () => ({
  default: { apps: [], initializeApp: vi.fn(), auth: () => ({ verifyIdToken }) },
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

  /** A request carrying a valid ID token. */
  const authed = (path: string) =>
    request(app).post(path).set("Authorization", "Bearer valid-token");

  let uidCounter = 0;
  let currentUid = "user_0";
  const today = () => new Date().toISOString().slice(0, 10);

  beforeEach(() => {
    vi.clearAllMocks();
    billingEventsAdd.mockResolvedValue({ id: "billing_event_1" });
    // A distinct caller per test: burst and quota state are per-user, so this
    // keeps one test's requests from spending another's allowance.
    currentUid = `user_${++uidCounter}`;
    verifyIdToken.mockResolvedValue({ uid: currentUid, email: "u@example.com" });
    usageDocs.clear();
    userPlan.value = "starter";
    delete process.env.ALLOW_SERVER_PROVIDER_KEY;
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

      const res = await authed("/api/generate")
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

      const res = await authed("/api/generate")
        .send({ prompt: "test", provider: "anthropic", apiKey: "sk-test" });

      expect(res.status).toBe(200);
      expect(res.body.provider).toBe("anthropic");
      expect(generateContentWithEngine).toHaveBeenCalledWith("test", {
        provider: "anthropic",
        apiKey: "sk-test",
      });
    });

    it("should reject a missing or empty prompt", async () => {
      const missing = await authed("/api/generate").send({});
      expect(missing.status).toBe(400);
      expect(missing.body.error).toBe("prompt is required");

      const blank = await authed("/api/generate").send({ prompt: "   " });
      expect(blank.status).toBe(400);

      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("should reject an unsupported provider", async () => {
      const res = await authed("/api/generate")
        .send({ prompt: "test", provider: "llama" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Unsupported AI provider: llama");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("should return 400 when the provider key is missing", async () => {
      generateContentWithEngine.mockRejectedValue(
        new Error("Anthropic API Key missing. Please add it in Settings.")
      );

      const res = await authed("/api/generate")
        .send({ prompt: "test", provider: "anthropic" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Anthropic API Key missing");
    });

    it("should return 502 when the provider call fails", async () => {
      generateContentWithEngine.mockRejectedValue(new Error("upstream exploded"));

      const res = await authed("/api/generate")
        .send({ prompt: "test" });

      expect(res.status).toBe(502);
      expect(res.body.error).toBe("upstream exploded");
    });
  });

  // ───────────── authentication and usage limits on /api/generate ─────────────
  // Codex flagged the unauthenticated route as P1 on this PR: an open endpoint
  // that reaches a provider is an open endpoint that spends money.
  describe("POST /api/generate access control", () => {
    beforeEach(() => {
      generateContentWithEngine.mockResolvedValue({ ok: true });
    });

    it("rejects a request with no Authorization header", async () => {
      const res = await request(app).post("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Authentication required.");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("rejects a malformed Authorization header", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", "Basic dXNlcjpwYXNz")
        .send({ prompt: "hi" });

      expect(res.status).toBe(401);
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("rejects a token the verifier refuses", async () => {
      verifyIdToken.mockRejectedValue(new Error("token expired"));

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(401);
      // The same message as "no token": which one it was is the attacker's problem.
      expect(res.body.error).toBe("Authentication required.");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("rejects a token that carries no uid", async () => {
      verifyIdToken.mockResolvedValue({ email: "u@example.com" });

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(401);
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("reports the remaining allowance on a successful call", async () => {
      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(200);
      expect(res.headers["x-quota-limit"]).toBe("50");
      expect(res.headers["x-quota-used"]).toBe("1");
    });

    it("refuses once the plan's daily allowance is spent", async () => {
      usageDocs.set(`${currentUid}_${today()}`, { count: 50 });

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(429);
      expect(res.body.error).toContain("starter");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("gives a larger plan a larger allowance for the same usage", async () => {
      userPlan.value = "agency";
      usageDocs.set(`${currentUid}_${today()}`, { count: 50 });

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(200);
      expect(res.headers["x-quota-limit"]).toBe("2000");
    });

    it("treats an unknown plan as the smallest, not the largest", async () => {
      userPlan.value = "enterprise-unlimited";

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.headers["x-quota-limit"]).toBe("50");
    });

    it("throttles a caller hammering the route", async () => {
      for (let i = 0; i < 10; i += 1) {
        expect((await authed("/api/generate").send({ prompt: "hi" })).status).toBe(200);
      }

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(429);
      expect(res.headers["retry-after"]).toBe("60");
    });

    it("fails closed, and does not crash, when the usage store errors", async () => {
      // Express 4 does not forward an async middleware's rejection to an error
      // handler, so an unguarded throw escapes as an unhandled rejection and
      // takes the process down. Refusing the request is the only safe outcome.
      firestoreMock.runTransaction.mockRejectedValueOnce(new Error("firestore unavailable"));

      const res = await authed("/api/generate").send({ prompt: "hi" });

      expect(res.status).toBe(503);
      expect(res.headers["retry-after"]).toBe("60");
      expect(generateContentWithEngine).not.toHaveBeenCalled();
    });

    it("does not reach for the server credential unless explicitly enabled", async () => {
      process.env.OPENAI_API_KEY = "server-side-value";

      await authed("/api/generate").send({ prompt: "hi", provider: "openai" });

      expect(generateContentWithEngine).toHaveBeenCalledWith("hi", {
        provider: "openai",
        apiKey: undefined,
      });
      delete process.env.OPENAI_API_KEY;
    });

    it("uses the server credential once explicitly enabled", async () => {
      process.env.ALLOW_SERVER_PROVIDER_KEY = "true";
      process.env.OPENAI_API_KEY = "server-side-value";

      await authed("/api/generate").send({ prompt: "hi", provider: "openai" });

      expect(generateContentWithEngine).toHaveBeenCalledWith("hi", {
        provider: "openai",
        apiKey: "server-side-value",
      });
      delete process.env.OPENAI_API_KEY;
    });

    it("still prefers a caller-supplied key over the server credential", async () => {
      process.env.ALLOW_SERVER_PROVIDER_KEY = "true";
      process.env.OPENAI_API_KEY = "server-side-value";

      await authed("/api/generate").send({
        prompt: "hi",
        provider: "openai",
        apiKey: "caller-key",
      });

      expect(generateContentWithEngine).toHaveBeenCalledWith("hi", {
        provider: "openai",
        apiKey: "caller-key",
      });
      delete process.env.OPENAI_API_KEY;
    });
  });
});
