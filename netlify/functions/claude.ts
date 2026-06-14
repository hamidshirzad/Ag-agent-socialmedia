import type { Handler } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";

const defaultClaudeSystem =
  `You are Co-pilot Core — an expert brand strategy consultant and creative director for Fourdoor AI. ` +
  `Produce precise, structured marketing output for the user's business. ` +
  `Always populate every field; never return null or placeholder values.`;

const structuredOutputTool: Anthropic.Messages.Tool = {
  name: "structured_output",
  description: "Return the response as a structured JSON object.",
  input_schema: { type: "object", additionalProperties: true },
};

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 50_000;
const MAX_SYSTEM_LENGTH = 10_000;

function isValidMessage(m: unknown): m is Anthropic.Messages.MessageParam {
  return (
    typeof m === "object" && m !== null &&
    ((m as any).role === "user" || (m as any).role === "assistant") &&
    typeof (m as any).content === "string" &&
    (m as any).content.length > 0 &&
    (m as any).content.length <= MAX_CONTENT_LENGTH
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body: { userKey?: unknown; messages?: unknown; systemPrompt?: unknown };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { userKey, messages, systemPrompt } = body;

  if (typeof userKey !== "string" || !userKey) {
    return { statusCode: 400, body: JSON.stringify({ error: "Anthropic API key missing." }) };
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES || !messages.every(isValidMessage)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid messages payload." }) };
  }
  if (systemPrompt !== undefined && (typeof systemPrompt !== "string" || systemPrompt.length > MAX_SYSTEM_LENGTH)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid systemPrompt." }) };
  }

  try {
    const client = new Anthropic({ apiKey: userKey });

    const resp = await client.messages.create(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: systemPrompt ?? defaultClaudeSystem,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [structuredOutputTool],
        tool_choice: { type: "tool", name: "structured_output" },
        messages,
      },
      { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } },
    );

    const toolUse = resp.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { statusCode: 500, body: JSON.stringify({ error: "Model did not return structured output." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toolUse.input),
    };
  } catch (error: any) {
    console.error("[claude]", error?.message ?? error);
    return { statusCode: 500, body: JSON.stringify({ error: error?.message ?? "Claude API call failed." }) };
  }
};
