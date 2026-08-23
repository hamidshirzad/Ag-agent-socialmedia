/**
 * Layer 1: source and build-config validation. No build, so this is fast enough
 * to run before every production build and inside the normal test suite.
 */

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { collectClientModules } from "./client-module-graph.mjs";
import { credentialsForRoot, scanSource } from "./forbidden-client-access.mjs";
import { analyzeViteConfig, extractAliases } from "./vite-config-analysis.mjs";

/**
 * Client-reachable files that are not worth reading as text. Everything else
 * that the browser can reach IS scanned, including JSON: an earlier version
 * only scanned source extensions, so `firebase-applet-config.json` — imported
 * by src/lib/firebase.ts and bundled into the browser build — was walked into
 * the graph and then silently skipped. A config file is exactly where someone
 * pastes a key.
 */
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|eot|mp4|webm|mp3|wav|pdf|zip)$/i;

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
  let aliases;
  try {
    const configText = readFileSync(viteConfigPath, "utf8");
    problems.push(...analyzeViteConfig(rel(viteConfigPath), configText).problems);

    // The module graph must follow the same aliases the bundler does. Reading
    // them from the config means repointing an alias cannot quietly shrink the
    // scanned set; an alias that cannot be evaluated is reported, not assumed.
    const extracted = extractAliases(rel(viteConfigPath), configText, root);
    problems.push(...extracted.problems);
    aliases = extracted.aliases;
  } catch {
    problems.push(`${rel(viteConfigPath)}: could not be read, so the build config was not validated.`);
  }

  const { modules, entries } = collectClientModules(root, aliases);
  if (entries.length === 0) {
    problems.push("No client entry point was found, so the source scan would pass vacuously.");
  }

  const scanned = [];
  for (const file of modules) {
    if (BINARY.test(file)) continue;
    scanned.push(rel(file));
    const result = scanSource(rel(file), readFileSync(file, "utf8"), credentials);
    problems.push(...result.problems);
    warnings.push(...result.warnings);
  }

  return { problems, warnings, scanned, credentials };
}
