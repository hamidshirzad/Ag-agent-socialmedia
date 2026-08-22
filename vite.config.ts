import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Server-owned secrets must never reach the client bundle.
//
// This config previously called `loadEnv(mode, '.', '')` — an empty prefix,
// which reads *every* environment variable including server-only secrets —
// and passed GEMINI_API_KEY through `define`. Anything in `define` is
// substituted into the emitted JavaScript as a literal, so setting that
// variable in a build environment would have published it to every visitor.
//
// Client code reads public configuration through `import.meta.env.VITE_*`,
// which Vite exposes safely. Never add a `define` entry for a credential, and
// never reintroduce `loadEnv` with an empty prefix.
//
// `npm run test:client-secrets` enforces this. See SECURITY.md.
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
