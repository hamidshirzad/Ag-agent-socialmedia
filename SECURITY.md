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
| `src/services/aiService.test.ts` | Cover the missing-key error and its exact wording. |
| `scripts/check-client-secrets.mjs` | New two-layer guard (below). |
| `scripts/lib/forbidden-client-access.mjs` | Credential-name rules. |
| `scripts/lib/server-credentials.mjs` | Derives the protected set from `.env.example`. |
| `scripts/lib/vite-config-analysis.mjs` | TypeScript-AST analysis of the build config. |
| `scripts/lib/client-module-graph.mjs` | Walks the client import graph. |
| `package.json` | Added the `test:client-secrets` script. |

Browser behaviour is unchanged apart from the removed fallback. Client callers
already passed the user's own key from Settings, and still do. A call with no
key now returns a controlled error — `Gemini API Key missing. Please add it in
Settings.` — which reveals nothing about server configuration.

### The guard

```
npm run test:client-secrets
```

The guard has **two layers**, and both are enforced automatically.

**Layer 1 — source and config** (`npm run validate:client-config`). Runs as
`prebuild`, so **a production build cannot be produced without it passing**, and
again inside `npm test`. It performs no build itself, so that wiring cannot
recurse. It checks:

- **The build config**, parsed with the TypeScript compiler API rather than
  regexes. Rejects a `define` property in any declaration form — unquoted,
  quoted, computed, shorthand — a spread it cannot prove free of one, and
  **every** `loadEnv` call (not just the first) whose prefix is empty, omitted,
  or not a provable string literal.
- **Every client-reachable module**, found by walking the import graph from the
  client entry — not by assuming everything lives in `src/`. `@` aliases to the
  repository root, so a shared root-level module is reachable and is scanned;
  `server.ts` is not reachable from the browser and is correctly not scanned,
  because it legitimately reads server credentials.

**Layer 2 — build output** (`npm run test:client-secrets`). Cleans `dist/`,
rebuilds with a unique fake canary in **every** guarded variable — each server
credential and each `VITE_` alias — then byte-scans every emitted artifact,
source maps and binary files included.

Both are required. Layer 2 alone cannot see a `define` re-added before any
client reads it, and cannot see a client environment read at all, because
esbuild minifies `process.env` to a short alias (`FGe.GEMINI_API_KEY`). Layer 1
alone misses anything reaching the browser by an unanticipated route.

### Which variables are protected

**Derived from `.env.example`, not hardcoded.** Every variable declared there
*without* the `VITE_` prefix is treated as server-owned, minus a short list of
documented public values (`APP_URL`, `NODE_ENV`, the PayPal plan IDs). A
hardcoded floor is unioned in so the guard still protects the known set if
`.env.example` is trimmed. **Adding a new secret to `.env.example` protects it
automatically** — that is the point of deriving it.

Currently protected: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LINKEDIN_CLIENT_SECRET`,
`FACEBOOK_CLIENT_SECRET`, `X_CLIENT_SECRET`, `TIKTOK_CLIENT_SECRET`,
`PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `FIREBASE_SERVICE_ACCOUNT`,
`DATABASE_URL` — and each one's `VITE_` alias.

**Explicitly allowed:** public browser configuration — `VITE_FIREBASE_API_KEY`,
the OAuth *client IDs*, `VITE_STRIPE_PUBLISHABLE_KEY`. These are published by
design and are a different thing from the matching `*_CLIENT_SECRET`. The
scanner judges a variable's **identity, never its value**, so an `AIza`-shaped
string is not itself a finding.

### How names are matched

By **name, not access syntax**. An earlier version matched expressions such as
`process.env.NAME`, and two independent reviews bypassed it within minutes:

```js
process.env.GEMINI_API_KEY          process?.env?.GEMINI_API_KEY
process.env["GEMINI_API_KEY"]       const { GEMINI_API_KEY } = process.env
import.meta.env.GEMINI_API_KEY      const e = process.env; e.GEMINI_API_KEY
(import.meta as any).env.NAME       ...and any future syntax
```

Every one must spell the name somewhere, so the rule is that the name may not
appear in client source at all. Deliberately conservative: a name inside a
comment is rejected too. A reworded comment is cheaper than a published
credential.

Non-credential client `process.env` reads are reported as **warnings** —
currently `src/services/videoService.ts`, which is inert but is the same family
of problem.

Canaries are never real credentials and never key-shaped. Never place a real
credential in these scripts, in tests, or in fixtures.

Known limit: a name assembled at runtime (`"GEMINI_" + "API_KEY"`) is invisible
to any textual scan. Layer 2 is the backstop.

### Continuous integration

`.github/workflows/ci.yml` runs on every pull request: clean install (`npm ci`),
lint, tests, build (which triggers layer 1), and the full client-secret guard.
Before this existed, no workflow ran on pull requests at all — `.circleci/config.yml`
is the unmodified CircleCI template — which is how a dependency rollback and a
lockfile drift reached main unnoticed.

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
