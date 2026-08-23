/**
 * Which local modules the browser can actually reach.
 *
 * Scanning `src/` was wrong in both directions. `vite.config.ts` maps `@` to
 * the repository ROOT, so a client file may import a root-level or shared
 * module that lives outside `src/` — those were invisible. And `server.ts`
 * legitimately reads server credentials, so a blanket "scan every file" would
 * flag correct code and train everyone to ignore the guard.
 *
 * So the graph is walked from the client entry, exactly as the bundler does:
 * a module is scanned if and only if the browser can reach it.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import ts from "typescript";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const CANDIDATE_SUFFIXES = [
  "",
  ...SOURCE_EXTENSIONS,
  ...SOURCE_EXTENSIONS.map((ext) => `/index${ext}`),
];

const EXCLUDED = /(^|[\\/])(node_modules|dist|coverage|\.git)([\\/]|$)/;

/** Module specifiers imported, re-exported, or dynamically imported by `text`. */
export function collectSpecifiers(fileName, text) {
  const specifiers = [];
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);

  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return specifiers;
}

/** Resolve a specifier to a local file, or null for bare/package imports. */
export function resolveSpecifier(root, importerPath, specifier) {
  let base;
  if (specifier.startsWith("@/")) {
    // vite.config.ts aliases `@` to the repository root.
    base = join(root, specifier.slice(2));
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = resolve(dirname(importerPath), specifier);
  } else if (specifier.startsWith("/")) {
    base = join(root, specifier.slice(1));
  } else {
    return null; // bare specifier: a package, not our source
  }

  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = base + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Client entry points, read from index.html's module scripts. */
export function findEntries(root) {
  const entries = [];
  const indexHtml = join(root, "index.html");
  if (existsSync(indexHtml)) {
    const html = readFileSync(indexHtml, "utf8");
    for (const [, src] of html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) {
      const resolved = resolveSpecifier(root, indexHtml, src);
      if (resolved) entries.push(resolved);
    }
  }
  if (entries.length === 0) {
    // Fall back to the conventional entry so a missing/renamed index.html
    // degrades to scanning something rather than to scanning nothing.
    for (const suffix of SOURCE_EXTENSIONS) {
      const fallback = join(root, "src", `main${suffix}`);
      if (existsSync(fallback)) return [fallback];
    }
  }
  return entries;
}

/**
 * Every local module reachable from the client entry.
 * @returns {{modules: string[], entries: string[]}} absolute paths
 */
export function collectClientModules(root) {
  const entries = findEntries(root);
  const seen = new Set();
  const queue = [...entries];

  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file) || EXCLUDED.test(relative(root, file))) continue;
    seen.add(file);

    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const specifier of collectSpecifiers(file, text)) {
      const resolved = resolveSpecifier(root, file, specifier);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }

  return { modules: [...seen].sort(), entries };
}
