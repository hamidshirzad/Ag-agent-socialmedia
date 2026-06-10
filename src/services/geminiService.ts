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

// Condensed Meta/Facebook Ads creative-diversification framework, injected into
// content-generation prompts so output varies across messaging angle, visual
// style, and placement/format — not just topic.
const CREATIVE_DIVERSIFICATION_GUIDE = `
<creative_diversification_guide>
  <messaging_angles>urgency, social proof, aspirational, problem/solution, seasonal/topical</messaging_angles>
  <visual_styles>people+product in context, functional benefit (what it does), emotional benefit (how it feels), lo-fi/UGC-style vs. polished/produced</visual_styles>
  <formats>Reel/Story (9:16, vertical, full-bleed), Feed/Carousel (4:5 or 1:1), Landscape (16:9 for link/banner placements)</formats>
  <mobile_first_rules>hook the viewer in the first 3 seconds; design so the message lands with sound off (captions/on-screen text) as well as sound on; keep short-form video tight and skippable-proof</mobile_first_rules>
</creative_diversification_guide>`.trim();

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

${CREATIVE_DIVERSIFICATION_GUIDE}

<output_instructions>
Return a JSON object with exactly these fields:
- tiktokScript: a complete, high-energy 30-second TikTok script including visual cues [Scene: ...] and spoken lines. Apply the mobile_first_rules: hook the viewer in the first 3 seconds and make sure the message lands with sound off (captions/on-screen text).
- linkedinPost: a professional thought-leadership post with conversational formatting, bullet points, and a strong CTA.
- xThread: a 3-tweet informative thread, each tweet prefixed with [Tweet N].
- hashtags: an array of exactly 10 targeted hashtags.
- suggestedImagePrompt: a vivid, non-cluttered image prompt. Pick one visual_style and one format (with aspect ratio) from the creative_diversification_guide that best fits this content, and name both explicitly in the prompt.
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

${CREATIVE_DIVERSIFICATION_GUIDE}

<output_instructions>
Each of the 3 ideas must use a DIFFERENT messaging_angle and a DIFFERENT visual_style from the creative_diversification_guide above, paired with a fitting format. Do not repeat the same angle, style, or format across the 3 ideas.

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
      "messagingAngle": "One messaging angle from the guide, e.g. urgency, social proof, aspirational, problem/solution, seasonal/topical",
      "recommendedFormat": "A placement + aspect ratio from the guide, e.g. 'Reel — 9:16, hook in first 3s'",
      "suggestedVisualPrompt": "A highly descriptive, artistic prompt to create a beautiful digital visual, naming the visual_style used (e.g. lo-fi/UGC vs. polished, functional vs. emotional benefit) and matching the recommended format's aspect ratio",
      "strategicReason": "How this solves the user's goals and hooks the specific audience"
    },
    { "id": "idea_2", "title": "...", "concept": "...", "targetPlatformFit": "...", "angleAndHook": "...", "messagingAngle": "...", "recommendedFormat": "...", "suggestedVisualPrompt": "...", "strategicReason": "..." },
    { "id": "idea_3", "title": "...", "concept": "...", "targetPlatformFit": "...", "angleAndHook": "...", "messagingAngle": "...", "recommendedFormat": "...", "suggestedVisualPrompt": "...", "strategicReason": "..." }
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

${CREATIVE_DIVERSIFICATION_GUIDE}

<output_instructions>
Return a JSON object with exactly these fields:
- tiktokScript: a complete, high-energy 30-second TikTok script including visual cues [Scene: ...] and spoken lines. Apply the mobile_first_rules: hook the viewer in the first 3 seconds and make sure the message lands with sound off (captions/on-screen text).
- linkedinPost: a professional thought-leadership post with conversational formatting, bullet points, and a strong CTA.
- xThread: a 3–5 tweet thread, each tweet prefixed with [Tweet N], designed to go viral and provide real value.
- hashtags: an array of exactly 10 targeted hashtags.
- suggestedImagePrompt: a vivid, non-cluttered image prompt building on the visual direction above. Pick the visual_style and format (with aspect ratio) from the creative_diversification_guide that best matches this idea, and name both explicitly.
</output_instructions>
  `.trim();

  return generateContentWithEngine(
    prompt,
    { provider, apiKey: pickKey(provider, apiKeys) },
    provider === 'anthropic' ? COPILOT_SYSTEM : undefined,
  );
}
