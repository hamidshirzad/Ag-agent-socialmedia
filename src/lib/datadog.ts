import tracer from 'dd-trace';

// Docker/local dev: DD_TRACE_AGENT_URL=unix:///var/run/datadog/apm.socket
// Vercel (serverless): leave DD_TRACE_AGENT_URL unset; use DD_API_KEY for agentless mode
const agentUrl = process.env.DD_TRACE_AGENT_URL?.trim();
const apiKey   = process.env.DD_API_KEY?.trim();

if (agentUrl || apiKey) {
  tracer.init({
    service: process.env.DD_SERVICE ?? 'fourdoorai',
    env:     process.env.DD_ENV     ?? process.env.NODE_ENV ?? 'production',
    site:    'datadoghq.eu',
    ...(agentUrl ? { url: agentUrl } : {}),
    llmobs: {
      mlApp:            process.env.DD_LLMOBS_ML_APP ?? 'fourdoorai',
      agentlessEnabled: !agentUrl,
      ...(agentUrl ? {} : { apiKey }),
    } as any,
  });
}

export default tracer;
export const LLMObs: typeof tracer.llmobs = tracer.llmobs;
