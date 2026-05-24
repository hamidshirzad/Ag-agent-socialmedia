import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface AIConfig {
  provider: 'gemini' | 'anthropic' | 'openai';
  apiKey?: string;
}

export async function generateContentWithEngine(
  prompt: string, 
  config: AIConfig
) {
  switch (config.provider) {
    case 'gemini':
      return callGemini(prompt, config.apiKey);
    case 'anthropic':
      return callClaude(prompt, config.apiKey);
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
    config: {
      responseMimeType: "application/json",
    }
  });
  
  return JSON.parse(response.text || "{}");
}

async function _callClaude(prompt: string, userKey?: string) {
  if (!userKey) throw new Error("Anthropic API Key missing. Please add it in Settings.");

  const anthropic = new Anthropic({ apiKey: userKey });

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    system: "You are a marketing strategist. Always return valid JSON."
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse JSON" };
  }
}

async function callOpenAI(prompt: string, userKey?: string) {
  if (!userKey) throw new Error("OpenAI API Key missing. Please add it in Settings.");
  
  const openai = new OpenAI({ apiKey: userKey });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content || "{}");
}
