import { generateContentWithEngine } from "./aiService";
import type { ApiKeys } from "../types";

// Persistent role injected as the system prompt for every Claude call.
// Defined once so it qualifies for prompt-cache hits across requests.
const COPILOT_SYSTEM =
  `You are Co-pilot Core — an expert brand strategy consultant and creative director for Fourdoor AI. ` +
  `Produce precise, structured marketing output for the user's business. ` +
  `Always populate every field; never return null or placeholder values.`;

const LEAD_INTEL_SYSTEM =
  `You are a lead intelligence engine. ` +
  `Classify the intent and buying-readiness of inbound prospect messages and produce actionable engagement data.`;

function pickKey(provider: 'gemini' | 'anthropic' | 'openai', apiKeys?: ApiKeys): string | undefined {
  if (provider === 'gemini')    return apiKeys?.gemini;
  if (provider === 'anthropic') return apiKeys?.anthropic;
  return apiKeys?.openai;
}

export async function generateMarketingContent(
  niche: string,
  targetAudience: string,
  goal: string,
  apiKeys?: ApiKeys,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini',
) {
  const prompt = `
<task>Generate a complete social media content package.</task>

<context>
  <niche>${niche}</niche>
  <target_audience>${targetAudience}</target_audience>
  <goal>${goal}</goal>
</context>

<output_instructions>
Return a JSON object with exactly these fields:
- tiktokScript: a complete, high-energy 30-second TikTok script including visual cues [Scene: ...] and spoken lines.
- linkedinPost: a professional thought-leadership post with conversational formatting, bullet points, and a strong CTA.
- xThread: a 3-tweet informative thread, each tweet prefixed with [Tweet N].
- hashtags: an array of exactly 10 targeted hashtags.
- suggestedImagePrompt: a vivid, non-cluttered prompt for a 16:9 background image.
</output_instructions>
  `.trim();

  return generateContentWithEngine(
    prompt,
    { provider, apiKey: pickKey(provider, apiKeys) },
    provider === 'anthropic' ? COPILOT_SYSTEM : undefined,
  );
}

export async function analyzeLeadIntent(message: string, apiKeys?: ApiKeys) {
  const prompt = `
<task>Analyze the intent of this prospect message.</task>
<message>${message}</message>

<output_instructions>
Return JSON with:
- intent: "casual" | "interested" | "buyer"
- suggestedResponse: a professional, helpful reply to the lead.
- leadScore: integer 0–100 reflecting buying signals.
- keyNeeds: what the prospect is looking for.
</output_instructions>
  `.trim();

  return generateContentWithEngine(
    prompt,
    { provider: 'gemini', apiKey: apiKeys?.gemini },
    LEAD_INTEL_SYSTEM,
  );
}

export async function generateContentIdeas(
  niche: string,
  targetAudience: string,
  goal: string,
  brief?: string,
  apiKeys?: ApiKeys,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini',
) {
  const prompt = `
<task>Generate 3 distinct, highly creative content ideas. Analyse the audience's psychological state and goal constraints.</task>

<context>
  <niche>${niche}</niche>
  <target_audience>${targetAudience}</target_audience>
  <goal>${goal}</goal>
  ${brief ? `<brief>${brief}</brief>` : ''}
</context>

<output_instructions>
Return a JSON object exactly matching this structure:
{
  "assistantIntroduction": "A professional, encouraging 1-2 sentence greeting explaining your creative focus for this niche.",
  "ideas": [
    {
      "id": "idea_1",
      "title": "Short, catchy title",
      "concept": "Engaging description of the content concept",
      "targetPlatformFit": "LinkedIn, X, or TikTok — explain why in 1 sentence",
      "angleAndHook": "The scroll-stopping hook or emotional angle",
      "suggestedVisualPrompt": "A highly descriptive, artistic prompt to create a beautiful digital visual",
      "strategicReason": "How this solves the user's goals and hooks the specific audience"
    },
    { "id": "idea_2", "title": "...", "concept": "...", "targetPlatformFit": "...", "angleAndHook": "...", "suggestedVisualPrompt": "...", "strategicReason": "..." },
    { "id": "idea_3", "title": "...", "concept": "...", "targetPlatformFit": "...", "angleAndHook": "...", "suggestedVisualPrompt": "...", "strategicReason": "..." }
  ]
}
</output_instructions>
  `.trim();

  return generateContentWithEngine(
    prompt,
    { provider, apiKey: pickKey(provider, apiKeys) },
    provider === 'anthropic' ? COPILOT_SYSTEM : undefined,
  );
}

export async function generateMarketingContentForIdea(
  niche: string,
  targetAudience: string,
  goal: string,
  ideaTitle: string,
  ideaConcept: string,
  ideaHookAndAngle: string,
  ideaVisualPrompt: string,
  apiKeys?: ApiKeys,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini',
) {
  const prompt = `
<task>Create a full content deployment package for the selected idea.</task>

<idea>
  <title>${ideaTitle}</title>
  <concept>${ideaConcept}</concept>
  <hook_and_angle>${ideaHookAndAngle}</hook_and_angle>
  <visual_direction>${ideaVisualPrompt}</visual_direction>
</idea>

<context>
  <niche>${niche}</niche>
  <target_audience>${targetAudience}</target_audience>
  <goal>${goal}</goal>
</context>

<output_instructions>
Return a JSON object with exactly these fields:
- tiktokScript: a complete, high-energy 30-second TikTok script including visual cues [Scene: ...] and spoken lines.
- linkedinPost: a professional thought-leadership post with conversational formatting, bullet points, and a strong CTA.
- xThread: a 3–5 tweet thread, each tweet prefixed with [Tweet N], designed to go viral and provide real value.
- hashtags: an array of exactly 10 targeted hashtags.
- suggestedImagePrompt: a vivid, non-cluttered, landscape (16:9) image prompt representing the visual direction above.
</output_instructions>
  `.trim();

  return generateContentWithEngine(
    prompt,
    { provider, apiKey: pickKey(provider, apiKeys) },
    provider === 'anthropic' ? COPILOT_SYSTEM : undefined,
  );
}
