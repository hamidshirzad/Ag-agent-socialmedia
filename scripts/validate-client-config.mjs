#!/usr/bin/env node
/**
 * Layer 1 only: build config and client sources. No build, no network.
 *
 * Wired to `prebuild`, so a production build cannot be produced without it
 * passing. It performs no build itself, so that wiring cannot recurse.
 *
 * Full verification, including the emitted-artifact canary scan, is
 * `npm run test:client-secrets`. See SECURITY.md.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateSources } from "./lib/validate-sources.mjs";

// `import.meta.dirname` requires Node >= 20.11. server.ts already uses this
// form, so the guard matches the runtime range the rest of the repo supports.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const { problems, warnings, scanned, credentials } = validateSources(ROOT);

console.log(
  `→ client-config validation: ${credentials.length} protected credentials, ` +
    `${scanned.length} client-reachable module(s)`,
);

if (warnings.length > 0) {
  console.warn("\n! warnings (not failures):");
  for (const w of warnings) console.warn(`    ${w}`);
}

if (problems.length > 0) {
  console.error("\n✗ client-config validation FAILED\n");
  for (const p of problems) console.error(`    ${p}`);
  console.error("\nSee SECURITY.md.\n");
  process.exit(1);
}

console.log("✓ client-config validation passed\n");
