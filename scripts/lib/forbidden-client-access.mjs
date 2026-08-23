/**
 * Rules for keeping server credentials out of client code and client builds.
 *
 * DESIGN: name-based, not syntax-based.
 *
 * An earlier version matched access *expressions*. Two independent reviews
 * bypassed it within minutes, because JavaScript offers unlimited ways to spell
 * the same read (bracket notation, optional chaining, destructuring, aliasing,
 * import.meta.env, TypeScript casts). Every one of them, however, must spell
 * the credential's NAME somewhere in the source text. So the rule is simply
 * that a forbidden name may not appear in client source at all.
 *
 * Deliberately conservative: a mention inside a comment is rejected too — a
 * false positive costs one reworded comment, a false negative costs a
 * published credential.
 *
 * Known limit: a name assembled at runtime ("GEMINI_" + "API_KEY") is invisible
 * to any textual scan. The build-output byte scan is the backstop.
 */

import { readServerCredentials } from "./server-credentials.mjs";

export { REQUIRED_FLOOR, deriveServerCredentials, parseEnvExampleNames } from "./server-credentials.mjs";

/** VITE_-prefixed aliases: publishing a secret under a public name is the same leak. */
export const aliasesFor = (credentials) => credentials.map((n) => `VITE_${n}`);

/**
 * Fake per-name canaries injected into the build environment. If client code
 * ever reads one of these variables — the credential or its VITE_ alias — Vite
 * substitutes its canary into the bundle and the byte scan finds it.
 * Never real credentials, never key-shaped.
 */
export function sentinelsFor(credentials) {
  const names = [...credentials, ...aliasesFor(credentials)];
  return Object.fromEntries(
    names.map((name, i) => [
      name,
      `CANARY_DO_NOT_SHIP__${name}__${(i + 1).toString(16).padStart(2, "0")}f91`,
    ]),
  );
}

/** The literal server-env reference, assembled so this file never contains it. */
export const FORBIDDEN_REF = ["process", "env", "GEMINI_API_KEY"].join(".");

/** SCREAMING_SNAKE identifiers, which is how every credential name is written. */
const NAME_TOKEN = /\b[A-Z][A-Z0-9_]{2,}\b/g;

/** Tolerates optional chaining and a TypeScript cast at either join. */
const CLIENT_ENV_READ =
  /process(?:\s+as\s+[\w$]+\s*\))?\s*(?:\?\s*)?\.\s*env(?:\s+as\s+[\w$]+\s*\))?\s*(?:\?\s*)?\.\s*([A-Za-z_$][\w$]*)/g;

/**
 * Reject forbidden credential names appearing anywhere in client source.
 *
 * @param {string} path display path for messages
 * @param {string} text file contents
 * @param {string[]} credentials server-owned names
 * @returns {{problems: string[], warnings: string[]}}
 */
export function scanSource(path, text, credentials) {
  const forbiddenAliases = new Set(aliasesFor(credentials));
  const forbiddenCredentials = new Set(credentials);
  const problems = [];
  const warnings = [];
  const seen = new Set();

  for (const [token] of text.matchAll(NAME_TOKEN)) {
    if (seen.has(token)) continue;
    seen.add(token);

    if (forbiddenAliases.has(token)) {
      problems.push(
        `${path}: mentions ${token}. The VITE_ prefix marks a value as public, ` +
          `so this would publish a server credential to the browser.`,
      );
    } else if (forbiddenCredentials.has(token)) {
      problems.push(
        `${path}: mentions the server credential ${token}. Client source must ` +
          `not name it in any form — read it in server.ts instead.`,
      );
    }
  }

  for (const [, name] of text.matchAll(CLIENT_ENV_READ)) {
    if (!forbiddenCredentials.has(name)) {
      warnings.push(
        `${path}: reads process.env.${name} in client code. Not a server ` +
          `credential, but the browser has no process.env.`,
      );
    }
  }

  return { problems, warnings };
}

/**
 * Reject any canary, or the literal server-env reference, in a built artifact.
 * Operates on bytes so source maps and binary files are searched identically.
 *
 * @param {string} path display path for messages
 * @param {Buffer} bytes artifact contents
 * @param {Record<string,string>} sentinels name -> canary
 * @returns {string[]} problems
 */
export function scanArtifactBytes(path, bytes, sentinels) {
  const problems = [];

  for (const [name, canary] of Object.entries(sentinels)) {
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

/** Load the credential list for a repository root. */
export function credentialsForRoot(root) {
  return readServerCredentials(`${root}/.env.example`);
}
