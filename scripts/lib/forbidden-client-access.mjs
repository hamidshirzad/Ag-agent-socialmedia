/**
 * Rules for keeping server credentials out of client code and client builds.
 *
 * Extracted from check-client-secrets.mjs so every rule can be unit-tested
 * directly, without running a production build.
 *
 * DESIGN: name-based, not syntax-based.
 *
 * An earlier version matched access *expressions* — `process.env.NAME`,
 * bracket forms, and so on. Two independent reviews bypassed it within
 * minutes, because JavaScript offers unlimited ways to spell the same read:
 *
 *     process.env.GEMINI_API_KEY          process?.env?.GEMINI_API_KEY
 *     process.env["GEMINI_API_KEY"]       const { GEMINI_API_KEY } = process.env
 *     import.meta.env.GEMINI_API_KEY      const e = process.env; e.GEMINI_API_KEY
 *     (import.meta as any).env.NAME       ...and any future syntax
 *
 * Chasing those is an arms race the scanner loses. Every one of them, however,
 * must spell the credential's name somewhere in the source text. So the rule is
 * simply: a forbidden name may not appear in client source at all.
 *
 * This is deliberately conservative. A mention inside a comment is also
 * rejected — a false positive costing one reworded comment, versus a false
 * negative costing a published credential.
 *
 * Known limit: a name assembled at runtime ("GEMINI_" + "API_KEY") is invisible
 * to any textual scan. The build-output byte scan is the backstop for that.
 */

/** Server-owned names that must never appear in client source. */
export const SERVER_CREDENTIALS = [
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FIREBASE_SERVICE_ACCOUNT",
  "DATABASE_URL",
];

/**
 * Browser-visible aliases of the above. The VITE_ prefix is Vite's marker for
 * "safe to publish", so VITE_GEMINI_API_KEY is not a workaround for the removed
 * `define` — it is the same leak under a friendlier name.
 *
 * Note this list is exactly SERVER_CREDENTIALS prefixed. Public browser config
 * such as VITE_FIREBASE_API_KEY is NOT here and is explicitly allowed: it is
 * published by design and is a different thing from FIREBASE_SERVICE_ACCOUNT.
 */
export const FORBIDDEN_ALIASES = SERVER_CREDENTIALS.map((n) => `VITE_${n}`);

/**
 * Fake per-name canaries injected into the build environment. If client code
 * ever reads one of these variables, Vite substitutes its canary into the
 * bundle and the byte scan finds it. Never real credentials, never key-shaped.
 */
export const SENTINELS = Object.fromEntries(
  [...SERVER_CREDENTIALS, ...FORBIDDEN_ALIASES].map((name, i) => [
    name,
    `CANARY_DO_NOT_SHIP__${name}__${(i + 1).toString(16).padStart(2, "0")}f91`,
  ]),
);

/** The literal server-env reference, assembled so this file never contains it. */
export const FORBIDDEN_REF = ["process", "env", "GEMINI_API_KEY"].join(".");

/** SCREAMING_SNAKE identifiers, which is how every credential name is written. */
const NAME_TOKEN = /\b[A-Z][A-Z0-9_]{2,}\b/g;

/**
 * Reject forbidden credential names appearing anywhere in client source.
 *
 * @param {string} path display path for messages
 * @param {string} text file contents
 * @returns {{problems: string[], warnings: string[]}}
 */
export function scanSource(path, text) {
  const problems = [];
  const warnings = [];
  const seen = new Set();

  for (const [token] of text.matchAll(NAME_TOKEN)) {
    if (seen.has(token)) continue;
    seen.add(token);

    if (FORBIDDEN_ALIASES.includes(token)) {
      problems.push(
        `${path}: mentions ${token}. The VITE_ prefix marks a value as public, ` +
          `so this would publish a server credential to the browser.`,
      );
    } else if (SERVER_CREDENTIALS.includes(token)) {
      problems.push(
        `${path}: mentions the server credential ${token}. Client source must ` +
          `not name it in any form — read it in server.ts instead.`,
      );
    }
  }

  // Kept as a warning: a pre-existing, inert client env read that is not a
  // server credential. Surfaced rather than hidden; not this PR's to fix.
  // Tolerates optional chaining and a TypeScript cast at either join, e.g.
  // `process?.env?.X` and `(process.env as any).X`.
  const CLIENT_ENV_READ =
    /process(?:\s+as\s+[\w$]+\s*\))?\s*(?:\?\s*)?\.\s*env(?:\s+as\s+[\w$]+\s*\))?\s*(?:\?\s*)?\.\s*([A-Za-z_$][\w$]*)/g;
  for (const [, name] of text.matchAll(CLIENT_ENV_READ)) {
    warnings.push(
      `${path}: reads process.env.${name} in client code. Not a server ` +
        `credential, but the browser has no process.env.`,
    );
  }

  return { problems, warnings };
}

/**
 * Reject any canary, or the literal server-env reference, in a built artifact.
 * Operates on bytes so source maps and binary files are searched identically.
 *
 * @param {string} path display path for messages
 * @param {Buffer} bytes artifact contents
 * @returns {string[]} problems
 */
export function scanArtifactBytes(path, bytes) {
  const problems = [];

  for (const [name, canary] of Object.entries(SENTINELS)) {
    if (bytes.includes(Buffer.from(canary, "utf8"))) {
      problems.push(
        `${path}: contains the canary for ${name}. A real value in that ` +
          `variable would ship to every visitor.`,
      );
    }
  }

  if (bytes.includes(Buffer.from(FORBIDDEN_REF, "utf8"))) {
    problems.push(
      `${path}: contains a direct server-environment reference (${FORBIDDEN_REF}).`,
    );
  }

  return problems;
}

/** Environment entries that arm every canary for a guarded build. */
export function sentinelEnv() {
  return { ...SENTINELS };
}
