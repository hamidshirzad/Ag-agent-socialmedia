#!/usr/bin/env node
/**
 * Client-secret guard.
 *
 * Two layers, because neither alone is sufficient:
 *
 *   1. SOURCE  — no forbidden credential name may appear in client source.
 *   2. OUTPUT  — build with a fake canary in every guarded variable, then byte
 *                scan every emitted artifact for those canaries.
 *
 * Why both. An output-only scan has two blind spots, each demonstrated against
 * this repository by two independent reviews:
 *
 *   a) A `define` re-added to vite.config.ts is invisible to an output scan
 *      until some client file also reads the value. The trap can be re-armed
 *      silently and spring later.
 *
 *   b) A direct client read of a server variable does NOT appear in a
 *      production bundle as a recognisable expression. esbuild minifies
 *      `process.env` to a short alias, so built output reads `FGe.GEMINI_API_KEY`.
 *
 * And a source-only scan misses anything reaching the browser by a route
 * nobody anticipated. The rules themselves live in
 * lib/forbidden-client-access.mjs and are unit-tested there.
 *
 * Usage: npm run test:client-secrets
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import {
  scanArtifactBytes,
  scanSource,
  sentinelEnv,
} from "./lib/forbidden-client-access.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "src");
const VITE_CONFIG = join(ROOT, "vite.config.ts");

const problems = [];
const warnings = [];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

// ---------------------------------------------------------------- layer 1
console.log("→ layer 1: build config and client sources");

const viteConfig = readFileSync(VITE_CONFIG, "utf8");

// Strip comments so this file's own documentation of the anti-pattern is not
// mistaken for the anti-pattern.
const viteCode = viteConfig
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

if (/\bdefine\s*:/.test(viteCode)) {
  problems.push(
    `${rel(VITE_CONFIG)}: has a \`define\` entry. Values passed through ` +
      `\`define\` are substituted into the bundle as literals. Client config ` +
      `belongs in VITE_-prefixed variables read via import.meta.env.`,
  );
}

const loadEnvCall = viteCode.match(/loadEnv\s*\(([^)]*)\)/);
if (loadEnvCall) {
  const prefix = loadEnvCall[1].split(",")[2]?.trim() ?? "";
  if (prefix === "" || prefix === "''" || prefix === '""') {
    problems.push(
      `${rel(VITE_CONFIG)}: calls loadEnv with an empty prefix, which reads ` +
        `every environment variable including server-only secrets. Use 'VITE_'.`,
    );
  }
}

for (const file of walk(SRC)) {
  if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue;
  const result = scanSource(rel(file), readFileSync(file, "utf8"));
  problems.push(...result.problems);
  warnings.push(...result.warnings);
}

// ---------------------------------------------------------------- layer 2
console.log("→ layer 2: cleaning dist/ and building with fake canaries");

rmSync(DIST, { recursive: true, force: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npm, ["run", "build"], {
  cwd: ROOT,
  stdio: "inherit",
  // Every guarded variable is armed, so a client read of ANY of them — the
  // server credential or its VITE_ alias — plants a unique canary we can find.
  env: { ...process.env, ...sentinelEnv() },
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
      problems.push(...scanArtifactBytes(rel(file), readFileSync(file)));
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

console.log("\n✓ client-secret check passed — config clean, sources clean, build output clean\n");
