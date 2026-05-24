import { generateContentWithEngine } from "./aiService";

interface ApiKeys { gemini?: string; anthropic?: string; openai?: string; }

export async function generateMarketingContent(
  niche: string,
  targetAudience: string,
  goal: string,
  apiKeys?: ApiKeys,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini'
) {
  const prompt = `
    Act as a senior marketing strategist. 
    Create a content package for a business in the ${niche} niche.
    Target Audience: ${targetAudience}
    Goal: ${goal}
    
    Return a JSON object with:
    - tiktokScript: A high-energy script for a 30s video.
    - linkedinPost: A professional thought-leadership post.
    - xThread: A 3-tweet informative thread.
    - hashtags: Array of 10 relevant hashtags.
    - suggestedImagePrompt: A prompt to generate a background image for these posts.
  `;

  const userKey = provider === 'gemini' ? apiKeys?.gemini : 
                  provider === 'anthropic' ? apiKeys?.anthropic : 
                  apiKeys?.openai;

  return generateContentWithEngine(prompt, { provider, apiKey: userKey });
}

export async function analyzeLeadIntent(message: string, apiKeys?: ApiKeys) {
  const prompt = `
    Analyze the intent of this message from a potential lead: "${message}"
    Determine:
    - intent: (casual | interested | buyer)
    - suggestedResponse: A professional, helpful response.
    - leadScore: (0-100) based on buying signals.
    - keyNeeds: What does the lead want?
    
    Return as JSON.
  `;

  return generateContentWithEngine(prompt, { provider: 'gemini', apiKey: apiKeys?.gemini });
}

export async function generateContentIdeas(
  niche: string,
  targetAudience: string,
  goal: string,
  brief?: string,
  apiKeys?: any,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini'
) {
  const prompt = `
    Act as "Co-pilot Core", an expert brand strategy consultant and creative director.
    Our user wants content ideas.
    Market Niche: ${niche}
    Target Audience: ${targetAudience}
    Primary Goal: ${goal}
    ${brief ? `User's Design Brief/Topic Focus: "${brief}"` : ""}

    Generate 3 distinct, highly creative content ideas. 
    Analyze the audience's psychological state and goal constraints.

    Return a JSON object exactly matching this structure (no other output, valid JSON):
    {
      "assistantIntroduction": "A professional, encouraging 1-2 sentence greeting explaining your creative focus for this niche and how these ideas hook the audience.",
      "ideas": [
        {
          "id": "idea_1",
          "title": "Short, catchy title",
          "concept": "Engaging description of the content concept",
          "targetPlatformFit": "LinkedIn, X, or TikTok (explain why in 1 sentence)",
          "angleAndHook": "The scroll-stopping hook or emotional angle of this piece",
          "suggestedVisualPrompt": "A highly descriptive, artistic prompt to create a beautiful digital visual or photograph representing this idea",
          "strategicReason": "Explain how this solves parent goals and hooks the specific audience"
        },
        {
          "id": "idea_2",
          "title": "Short, catchy title",
          "concept": "Engaging description of the content concept",
          "targetPlatformFit": "LinkedIn, X, or TikTok",
          "angleAndHook": "The scroll-stopping hook or emotional angle of this piece",
          "suggestedVisualPrompt": "A highly descriptive, artistic prompt to create a beautiful digital visual or photograph representing this idea",
          "strategicReason": "Explain how this solves parent goals and hooks the specific audience"
        },
        {
          "id": "idea_3",
          "title": "Short, catchy title",
          "concept": "Engaging description of the content concept",
          "targetPlatformFit": "LinkedIn, X, or TikTok",
          "angleAndHook": "The scroll-stopping hook or emotional angle of this piece",
          "suggestedVisualPrompt": "A highly descriptive, artistic prompt to create a beautiful digital visual or photograph representing this idea",
          "strategicReason": "Explain how this solves parent goals and hooks the specific audience"
        }
      ]
    }
  `;

  const userKey = provider === 'gemini' ? apiKeys?.gemini : 
                  provider === 'anthropic' ? apiKeys?.anthropic : 
                  apiKeys?.openai;

  return generateContentWithEngine(prompt, { provider, apiKey: userKey });
}

export async function generateMarketingContentForIdea(
  niche: string,
  targetAudience: string,
  goal: string,
  ideaTitle: string,
  ideaConcept: string,
  ideaHookAndAngle: string,
  ideaVisualPrompt: string,
  apiKeys?: any,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini'
) {
  const prompt = `
    Act as a senior marketing copywriter and copy director. 
    Create a detailed full content deployment package for the following brainstormed idea:
    
    Category Idea: "${ideaTitle}"
    Core Concept: ${ideaConcept}
    Angle and Hook: ${ideaHookAndAngle}
    Visual Direction: ${ideaVisualPrompt}
    
    Context:
    - Business Niche: ${niche}
    - Target Audience: ${targetAudience}
    - Campaign Goal: ${goal}
    
    Provide pristine copy and structure for multiple formats.
    Return a JSON object exactly matching this structure (no other output):
    {
      "tiktokScript": "A complete, high-energy 30-second TikTok script (include visual cues [Scene: ...] and speaking lines)",
      "linkedinPost": "A professional, high-engaging thought leadership LinkedIn post with conversational formatting, bullet points, and strong CTA",
      "xThread": "A 3-5 tweet informative thread, clearly split with [Tweet 1], [Tweet 2], etc., designed to go viral and provide real value",
      "hashtags": ["list", "of", "10", "highly", "targeted", "hashtags"],
      "suggestedImagePrompt": "A highly descriptive, high-quality, non-cluttered prompt to generate a stunning landscape image (16:9 aspect ratio) representing: ${ideaVisualPrompt}"
    }
  `;

  const userKey = provider === 'gemini' ? apiKeys?.gemini : 
                  provider === 'anthropic' ? apiKeys?.anthropic : 
                  apiKeys?.openai;

  return generateContentWithEngine(prompt, { provider, apiKey: userKey });
}
