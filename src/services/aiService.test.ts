import { describe, it, expect, vi } from "vitest";
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

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(function() {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "text", text: '{"claude": true}' }]
        })
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

describe("aiService / generateContentWithEngine", () => {
  it("should route to gemini correctly", async () => {
    const result = await generateContentWithEngine("test", { provider: "gemini", apiKey: "key" });
    expect(result).toEqual({ success: true });
  });

  it("should route to anthropic correctly", async () => {
    const result = await generateContentWithEngine("test", { provider: "anthropic", apiKey: "key" });
    expect(result).toEqual({ claude: true });
  });

  it("should route to openai correctly", async () => {
    const result = await generateContentWithEngine("test", { provider: "openai", apiKey: "key" });
    expect(result).toEqual({ gpt: true });
  });

  it("should throw for unsupported provider", async () => {
    // @ts-ignore
    await expect(generateContentWithEngine("test", { provider: "invalid" }))
      .rejects.toThrow("Unsupported AI Provider");
  });

  it("should throw for missing keys", async () => {
    await expect(generateContentWithEngine("test", { provider: "anthropic" }))
      .rejects.toThrow("Anthropic API Key missing");
      
    await expect(generateContentWithEngine("test", { provider: "openai" }))
      .rejects.toThrow("OpenAI API Key missing");
  });

  it("should attempt extraction for Claude if JSON parsing fails", async () => {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    // @ts-ignore
    Anthropic.mockImplementationOnce(function() {
      return {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: 'Prose text... {"extracted": true} more prose' }]
          })
        }
      };
    });

    const result = await generateContentWithEngine("test", { provider: "anthropic", apiKey: "key" });
    expect(result).toEqual({ extracted: true });
  });
});
