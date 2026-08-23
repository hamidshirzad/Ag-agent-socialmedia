/**
 * Layer 1: source and build-config validation. No build, so this is fast enough
 * to run before every production build and inside the normal test suite.
 */

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { collectClientModules } from "./client-module-graph.mjs";
import { credentialsForRoot, scanSource } from "./forbidden-client-access.mjs";
import { analyzeViteConfig } from "./vite-config-analysis.mjs";

const SCANNABLE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

/**
 * @param {string} root repository root
 * @returns {{problems: string[], warnings: string[], scanned: string[], credentials: string[]}}
 */
export function validateSources(root) {
  const problems = [];
  const warnings = [];
  const credentials = credentialsForRoot(root);
  const rel = (f) => relative(root, f).split("\\").join("/");

  const viteConfigPath = join(root, "vite.config.ts");
  try {
    const configText = readFileSync(viteConfigPath, "utf8");
    problems.push(...analyzeViteConfig(rel(viteConfigPath), configText).problems);
  } catch {
    problems.push(`${rel(viteConfigPath)}: could not be read, so the build config was not validated.`);
  }

  const { modules, entries } = collectClientModules(root);
  if (entries.length === 0) {
    problems.push("No client entry point was found, so the source scan would pass vacuously.");
  }

  const scanned = [];
  for (const file of modules) {
    if (!SCANNABLE.test(file)) continue;
    scanned.push(rel(file));
    const result = scanSource(rel(file), readFileSync(file, "utf8"), credentials);
    problems.push(...result.problems);
    warnings.push(...result.warnings);
  }

  return { problems, warnings, scanned, credentials };
}
