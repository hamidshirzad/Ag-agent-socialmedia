import tracer from 'dd-trace';

const apiKey = process.env.DD_API_KEY?.trim();

if (apiKey) {
  tracer.init({
    service: process.env.DD_SERVICE   ?? 'fourdoorai',
    env:     process.env.NODE_ENV     ?? 'production',
    site:    'datadoghq.eu',
    llmobs: {
      mlApp:            process.env.DD_LLMOBS_ML_APP ?? 'fourdoorai',
      agentlessEnabled: true,
      apiKey,
    } as any,
  });
}

export default tracer;
export const LLMObs: typeof tracer.llmobs = tracer.llmobs;
