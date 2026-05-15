import { generateContentWithEngine } from "./aiService";

export async function generateMarketingContent(
  niche: string, 
  targetAudience: string, 
  goal: string, 
  apiKeys?: any,
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

export async function generateJobListings(
  industry: string,
  seniority: string,
  count: number,
  apiKeys?: any,
  provider: 'gemini' | 'anthropic' | 'openai' = 'gemini'
) {
  const prompt = `
    Act as a senior recruiter. Generate ${count} realistic job listings for the ${industry} industry.
    Seniority level: ${seniority}

    Return a JSON object with exactly these keys:
    - job_categories: Array of category strings (e.g. "Engineering", "Design")
    - jobs: Array of { company_name: string, role: string }

    Make company names realistic and varied. Roles should match the seniority level.
  `;

  const userKey = provider === 'gemini' ? apiKeys?.gemini
                : provider === 'anthropic' ? apiKeys?.anthropic
                : apiKeys?.openai;

  return generateContentWithEngine(prompt, { provider, apiKey: userKey });
}

export async function analyzeLeadIntent(message: string, apiKeys?: any) {
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
