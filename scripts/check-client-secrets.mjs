#!/usr/bin/env node
/**
 * Client-secret guard.
 *
 * Two layers, because neither alone is sufficient:
 *
 *   1. SOURCE  — static checks on the build config and client sources.
 *   2. OUTPUT  — build with a fake server credential and scan every artifact.
 *
 * Why both. The output scan alone has two blind spots, each demonstrated
 * against this repository:
 *
 *   a) A `define` entry re-added to vite.config.ts is invisible to an output
 *      scan until some client file also reads the value. The trap can be
 *      re-armed silently and spring later.
 *
 *   b) A direct client read of a server variable does NOT appear in a
 *      production bundle as `process.env.NAME`. esbuild minifies `process.env`
 *      to a short alias, so the built output reads `FGe.GEMINI_API_KEY`.
 *      Grepping minified output for the qualified form finds nothing.
 *
 * The source layer catches the cause; the output layer catches anything that
 * reaches the browser by a route nobody anticipated.
 *
 * Why a sentinel rather than a key-shaped pattern: scanning for real key shapes
 * (for example the "AIza" prefix) only proves today's keys are absent, and
 * forces a whitelist for the Firebase browser key, which is public by design
 * and rotates. A sentinel proves the mechanism is closed: if the build can
 * carry this value to the browser, it can carry a real one.
 *
 * Usage: npm run test:client-secrets
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "src");
const VITE_CONFIG = join(ROOT, "vite.config.ts");

// Fake. Never a real credential.
const SENTINEL = "GEMINI_CANARY_DO_NOT_SHIP_7f91";

// Server-owned names that must never be read by client code.
const SERVER_CREDENTIALS = [
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FIREBASE_SERVICE_ACCOUNT",
  "DATABASE_URL",
];

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
console.log("→ layer 1: checking build config and client sources");

const viteConfig = readFileSync(VITE_CONFIG, "utf8");

// Strip comments so documentation about the anti-pattern is not mistaken for it.
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
  const unrestricted = prefix === "" || prefix === "''" || prefix === '""';
  if (unrestricted) {
    problems.push(
      `${rel(VITE_CONFIG)}: calls loadEnv with an empty prefix, which reads ` +
        `every environment variable including server-only secrets. Use 'VITE_'.`,
    );
  }
}

for (const file of walk(SRC)) {
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/process\s*\.\s*env\s*(?:as\s+\w+\s*\))?\s*\.?\s*(\w+)?/g)) {
    const name = match[1];
    if (name && SERVER_CREDENTIALS.includes(name)) {
      problems.push(
        `${rel(file)}: client code reads the server credential ${name} from ` +
          `the environment. Server credentials must be read in server.ts only.`,
      );
    } else {
      warnings.push(
        `${rel(file)}: reads process.env${name ? `.${name}` : ""} in client ` +
          `code. Not a server credential, but the browser has no process.env.`,
      );
    }
  }
}

// ---------------------------------------------------------------- layer 2
console.log("→ layer 2: cleaning dist/ and building with a fake credential");

rmSync(DIST, { recursive: true, force: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npm, ["run", "build"], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, GEMINI_API_KEY: SENTINEL },
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
    const needle = Buffer.from(SENTINEL, "utf8");
    for (const file of files) {
      // Read as bytes so source maps and binary artifacts (images, fonts) are
      // searched exactly like text, with no encoding assumptions.
      if (readFileSync(file).includes(needle)) {
        problems.push(
          `${rel(file)}: contains the server credential sentinel. A real key ` +
            `set in the build environment would ship to every visitor.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------- report
if (warnings.length > 0) {
  console.warn("\n! warnings (not failures):");
  for (const w of warnings) console.warn(`    ${w}`);
}

if (problems.length > 0) {
  console.error(`\n✗ client-secret check FAILED\n`);
  for (const p of problems) console.error(`    ${p}`);
  console.error("\nSee SECURITY.md.\n");
  process.exit(1);
}

console.log("\n✓ client-secret check passed — config clean, sources clean, build output clean\n");
