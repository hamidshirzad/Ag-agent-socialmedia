# Security

## Keeping server credentials out of the browser bundle

### What this is

A **latent exposure mechanism** was found in the client build configuration. It
is **not a confirmed breach**. No credential was found in any deployed asset,
and no key rotation is required as a result of this finding.

### The mechanism

`vite.config.ts` previously did two things that combined into a credential leak
waiting for a trigger:

```js
const env = loadEnv(mode, '.', '');            // empty prefix: reads EVERY env var
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}
```

Anything passed through Vite's `define` is substituted into the emitted
JavaScript **as a literal**. Because the prefix was empty, `loadEnv` could see
server-only secrets, not just the `VITE_`-prefixed values intended for the
browser. The substituted value was read by `callGemini` in
`src/services/aiService.ts`, which is reachable from client code.

### Why nothing leaked

`GEMINI_API_KEY` was never configured in the deployment environment, so the
substitution resolved to an empty string. The production bundle was inspected
directly and compiles to `const t = e || ""` at the Gemini call site — an empty
value, not a credential.

The one `AIza…` value visible in the production bundle is the **Firebase Web API
key, which is public by design** and is not affected by this change.

### Why it still mattered

The trigger was one step away. Adding a server-side AI endpoint requires
`GEMINI_API_KEY` to be present in the environment — and the moment it was set,
the next production build would have written it into the public bundle. Removing
the variable afterwards would not have been enough; the key would have needed
rotation, and previously served assets could retain it.

### What changed

| File | Change |
| --- | --- |
| `vite.config.ts` | Removed the `define` entry and the unrestricted `loadEnv` call entirely. |
| `src/services/aiService.ts` | `callGemini` no longer falls back to a server environment value; the key must be supplied explicitly. |
| `scripts/check-client-secrets.mjs` | New build-output guard (below). |
| `package.json` | Added the `test:client-secrets` script. |

Browser behaviour is unchanged apart from the removed fallback. Client callers
already passed the user's own key from Settings, and still do. A call with no
key now returns a controlled error — `Gemini API Key missing. Please add it in
Settings.` — which reveals nothing about server configuration.

### The guard

```
npm run test:client-secrets
```

This cleans `dist/`, rebuilds the client with a **fake** sentinel value in
`GEMINI_API_KEY`, and scans every emitted artifact — source maps and binary
files included — failing if either the sentinel or a direct server-environment
reference appears.

Two deliberate design choices:

- **A sentinel, not a key-shaped pattern.** Scanning for real key prefixes only
  proves today's keys are absent, and would require whitelisting the public
  Firebase key, which rotates. The sentinel proves the *mechanism* is closed.
- **The fully-qualified environment reference only.** The bundled
  `@google/genai` SDK contains its own server-side lookup of the bare name
  `GEMINI_API_KEY`. Matching the bare name would fail forever on third-party
  code. **Do not widen the check.**

Never place a real credential in this script, in tests, or in fixtures.

### Rules for contributors

1. Never add a `define` entry for a credential in `vite.config.ts`.
2. Never call `loadEnv` with an empty prefix.
3. Never create `VITE_GEMINI_API_KEY` or any other client-visible alias for a
   server credential. The `VITE_` prefix means *public*.
4. Client code may use only a key the user supplied themselves.

### Server-side boundary (future work)

A server-side `POST /api/generate` endpoint is proposed separately. When it
lands, it must read the server-owned credential from the environment **at the
call site in `server.ts`**, which runs under `tsx` and is never processed by the
client build. `src/services/aiService.ts` is shared by both browser and server,
which is precisely why the implicit fallback was unsafe there.

That endpoint is a **separate security boundary** and is not addressed here.
Keeping a credential out of the browser does not stop an unauthenticated caller
from spending it through the server. That endpoint must verify a Firebase ID
token and enforce per-user quotas before invoking any provider.

### Deployment order

`GEMINI_API_KEY` must remain **unset** in all deployment environments until:

1. This change is merged and deployed, and
2. The served production assets have been re-scanned and confirmed clean.

Setting it before then is the single action that turns this latent bug into a
real leak.
