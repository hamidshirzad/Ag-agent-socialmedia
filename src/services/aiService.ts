import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export interface AIConfig {
  provider: 'gemini' | 'anthropic' | 'openai';
  apiKey?: string;
}

export async function generateContentWithEngine(
  prompt: string,
  config: AIConfig,
  systemPrompt?: string,
) {
  switch (config.provider) {
    case 'gemini':
      return callGemini(prompt, config.apiKey);
    case 'anthropic':
      return callClaude(prompt, systemPrompt, config.apiKey);
    case 'openai':
      return callOpenAI(prompt, config.apiKey);
    default:
      throw new Error("Unsupported AI Provider");
  }
}

async function callGemini(prompt: string, userKey?: string) {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  const response = await (ai as any).models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  return JSON.parse(response.text || "{}");
}

// Claude runs server-side via the /api/ai/claude proxy to keep the API key out of the browser.
async function callClaude(prompt: string, systemPrompt?: string, userKey?: string) {
  if (!userKey) throw new Error("Anthropic API Key missing. Please add it in Settings.");

  const res = await fetch("/api/ai/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userKey,
      systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Claude API call failed.");
  }
  return res.json();
}

async function callOpenAI(prompt: string, userKey?: string) {
  if (!userKey) throw new Error("OpenAI API Key missing. Please add it in Settings.");

  const openai = new OpenAI({ apiKey: userKey, dangerouslyAllowBrowser: true });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
