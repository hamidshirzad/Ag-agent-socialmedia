import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateContentWithEngine } from "./aiService";

// Mock the AI SDKs
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(function() {
    return {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: '{"success": true}' })
      }
    };
  })
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(function() {
    return {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"gpt": true}' } }]
          })
        }
      }
    };
  })
}));

// Claude now proxies through /.netlify/functions/claude — mock global fetch
const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ claude: true }),
  });
});

describe("aiService / generateContentWithEngine", () => {
  it("routes to Gemini correctly", async () => {
    const result = await generateContentWithEngine("test", { provider: "gemini", apiKey: "key" });
    expect(result).toEqual({ success: true });
  });

  it("routes to Anthropic via /.netlify/functions/claude proxy", async () => {
    const result = await generateContentWithEngine("test", { provider: "anthropic", apiKey: "key" });
    expect(result).toEqual({ claude: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "/.netlify/functions/claude",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("forwards systemPrompt to the Claude proxy", async () => {
    await generateContentWithEngine("test", { provider: "anthropic", apiKey: "key" }, "custom system");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.systemPrompt).toBe("custom system");
  });

  it("routes to OpenAI correctly", async () => {
    const result = await generateContentWithEngine("test", { provider: "openai", apiKey: "key" });
    expect(result).toEqual({ gpt: true });
  });

  it("throws for unsupported provider", async () => {
    // @ts-ignore
    await expect(generateContentWithEngine("test", { provider: "invalid" }))
      .rejects.toThrow("Unsupported AI Provider");
  });

  it("throws for missing Anthropic key", async () => {
    await expect(generateContentWithEngine("test", { provider: "anthropic" }))
      .rejects.toThrow("Anthropic API Key missing");
  });

  it("throws for missing OpenAI key", async () => {
    await expect(generateContentWithEngine("test", { provider: "openai" }))
      .rejects.toThrow("OpenAI API Key missing");
  });

  it("throws when Claude proxy returns an error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: "Model failed." }),
    });
    await expect(generateContentWithEngine("test", { provider: "anthropic", apiKey: "key" }))
      .rejects.toThrow("Model failed.");
  });
});
