import { GoogleGenAI } from "@google/genai";

export interface VideoGenerationConfig {
  prompt: string;
  imageB64?: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export async function generateVeoVideo(
  config: VideoGenerationConfig,
  onProgress: (status: string) => void,
  apiKey?: string
): Promise<string> {
  const resolvedKey = apiKey ?? import.meta.env.VITE_GOOGLE_API_KEY;
  if (!resolvedKey) throw new Error("Google API Key missing. Please add it in Settings.");

  const ai = new GoogleGenAI({ apiKey: resolvedKey });

  onProgress("Initializing Neural Sequence...");
  
  const videoPayload: any = {
    model: 'veo-3.1-lite-generate-preview',
    prompt: config.prompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  };

  if (config.imageB64) {
    videoPayload.image = {
      imageBytes: config.imageB64,
      mimeType: 'image/png'
    };
  }

  let operation = await (ai as any).models.generateVideos(videoPayload);

  onProgress("Synthesizing Video Latents...");

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes at 10s intervals
  
  while (!operation.done && attempts < maxAttempts) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    onProgress(`Rendering... (${attempts * 10}s)`);
    
    try {
      operation = await (ai as any).operations.getVideosOperation({ operation: operation });
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        throw new Error("KEY_NOT_FOUND");
      }
      throw err;
    }
  }

  if (!operation.done) {
    throw new Error("Video generation timed out.");
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("No video URL produced in the response.");
  }

  onProgress("Fetching Artifact...");

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': resolvedKey,
    },
  });

  if (!response.ok) throw new Error("Failed to download generated video.");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
