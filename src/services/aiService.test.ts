import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const mockMessagesCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  })),
}));

const mockChatCompletionsCreate = vi.fn();
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockChatCompletionsCreate } },
  })),
}));

import { generateContentWithEngine } from "./aiService";

describe("generateContentWithEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("routes to Gemini and returns parsed JSON", async () => {
    mockGenerateContent.mockResolvedValue({ text: '{"title":"test"}' });

    const result = await generateContentWithEngine("prompt", {
      provider: "gemini",
      apiKey: "gemini-key",
    });

    expect(result).toEqual({ title: "test" });
  });

  it("routes to Anthropic and returns parsed JSON", async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: "text", text: '{"result":1}' }],
    });

    const result = await generateContentWithEngine("prompt", {
      provider: "anthropic",
      apiKey: "sk-test",
    });

    expect(result).toEqual({ result: 1 });
  });

  it("routes to OpenAI and returns parsed JSON", async () => {
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"out":"ok"}' } }],
    });

    const result = await generateContentWithEngine("prompt", {
      provider: "openai",
      apiKey: "sk-test",
    });

    expect(result).toEqual({ out: "ok" });
  });

  it("throws for unsupported provider", async () => {
    await expect(
      generateContentWithEngine("prompt", { provider: "unknown" as any })
    ).rejects.toThrow("Unsupported AI Provider");
  });

  it("throws when Anthropic API key is missing", async () => {
    await expect(
      generateContentWithEngine("prompt", { provider: "anthropic" })
    ).rejects.toThrow("Anthropic API Key missing");
  });

  it("throws when OpenAI API key is missing", async () => {
    await expect(
      generateContentWithEngine("prompt", { provider: "openai" })
    ).rejects.toThrow("OpenAI API Key missing");
  });

  it("throws when Gemini API key is missing (no env var, no userKey)", async () => {
    await expect(
      generateContentWithEngine("prompt", { provider: "gemini" })
    ).rejects.toThrow("Gemini API Key missing");
  });

  it("uses GEMINI_API_KEY env var when no userKey provided", async () => {
    process.env.GEMINI_API_KEY = "env-key";
    mockGenerateContent.mockResolvedValue({ text: '{"env":true}' });

    const result = await generateContentWithEngine("prompt", { provider: "gemini" });

    expect(result).toEqual({ env: true });
  });

  it("Claude fallback: extracts JSON object embedded in prose", async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: "text", text: 'Here is your result: {"extracted":true} — done.' }],
    });

    const result = await generateContentWithEngine("prompt", {
      provider: "anthropic",
      apiKey: "sk-test",
    });

    expect(result).toEqual({ extracted: true });
  });

  it("Claude fallback: returns error object when no JSON can be found", async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: "text", text: "Plain text response with no JSON at all." }],
    });

    const result = await generateContentWithEngine("prompt", {
      provider: "anthropic",
      apiKey: "sk-test",
    });

    expect(result).toEqual({ error: "Failed to parse JSON" });
  });
});
