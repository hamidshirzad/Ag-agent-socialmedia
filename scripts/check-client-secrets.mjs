#!/usr/bin/env node
/**
 * Client-secret guard: both layers.
 *
 *   1. SOURCE  — no forbidden credential name in any client-reachable module,
 *                and no `define` / unrestricted `loadEnv` in the build config.
 *   2. OUTPUT  — build with a fake canary in every guarded variable, then byte
 *                scan every emitted artifact for those canaries.
 *
 * Neither is sufficient alone. Layer 2 cannot see a `define` re-added before
 * any client reads it, and cannot see a client env read at all (esbuild
 * minifies `process.env` to a short alias). Layer 1 cannot see anything that
 * reaches the browser by a route nobody anticipated.
 *
 * Usage: npm run test:client-secrets
 */

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  credentialsForRoot,
  scanArtifactBytes,
  sentinelsFor,
} from "./lib/forbidden-client-access.mjs";
import { validateSources } from "./lib/validate-sources.mjs";

// Node >= 20.11 is required for `import.meta.dirname`; this form works on 18.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const rel = (f) => relative(ROOT, f).split("\\").join("/");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------- layer 1
console.log("→ layer 1: build config and client-reachable sources");
const source = validateSources(ROOT);
const problems = [...source.problems];
const warnings = [...source.warnings];
console.log(
  `  ${source.credentials.length} protected credentials, ` +
    `${source.scanned.length} client-reachable module(s)`,
);

// ---------------------------------------------------------------- layer 2
console.log("→ layer 2: cleaning dist/ and building with fake canaries");

const sentinels = sentinelsFor(credentialsForRoot(ROOT));
rmSync(DIST, { recursive: true, force: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npm, ["run", "build"], {
  cwd: ROOT,
  stdio: "inherit",
  // Every guarded variable is armed, so a client read of ANY of them plants a
  // unique canary we can find.
  env: { ...process.env, ...sentinels },
});

if (build.error) {
  problems.push(`Build could not be started: ${build.error.message}`);
} else if (build.status !== 0) {
  problems.push(`Build exited with status ${build.status}.`);
} else {
  let files = [];
  try {
    files = walk(DIST);
  } catch {
    problems.push("dist/ was not produced by the build; nothing was scanned.");
  }
  if (files.length === 0) {
    problems.push("dist/ is empty, so the output scan would pass vacuously.");
  } else {
    console.log(`→ scanning ${files.length} emitted artifact(s)`);
    for (const file of files) {
      problems.push(...scanArtifactBytes(rel(file), readFileSync(file), sentinels));
    }
  }
}

// ---------------------------------------------------------------- report
if (warnings.length > 0) {
  console.warn("\n! warnings (not failures):");
  for (const w of warnings) console.warn(`    ${w}`);
}

if (problems.length > 0) {
  console.error("\n✗ client-secret check FAILED\n");
  for (const p of problems) console.error(`    ${p}`);
  console.error("\nSee SECURITY.md.\n");
  process.exit(1);
}

console.log("\n✓ client-secret check passed — config, sources and build output all clean\n");
