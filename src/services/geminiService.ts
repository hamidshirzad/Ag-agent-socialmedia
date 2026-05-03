async function callGenerateAPI(
  prompt: string,
  provider: 'gemini' | 'anthropic' | 'openai',
  apiKey?: string,
) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Generation failed');
  }
  return res.json();
}

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

  return callGenerateAPI(prompt, provider, userKey);
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

  return callGenerateAPI(prompt, 'gemini', apiKeys?.gemini);
}
