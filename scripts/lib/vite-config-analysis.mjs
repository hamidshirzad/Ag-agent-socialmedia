/**
 * Static analysis of vite.config.ts, using the TypeScript compiler API.
 *
 * The previous version used regexes — `/\bdefine\s*:/` and a single
 * `String.match` for loadEnv — and both were bypassable by ordinary JavaScript:
 *
 *   { "define": {...} }              quoted property        — regex missed it
 *   { ["define"]: {...} }            computed property      — regex missed it
 *   const define = {...}; ({define}) shorthand              — regex missed it
 *   loadEnv(m,'.','VITE_'); loadEnv(m,'.','')   second call — String.match
 *                                                             only sees the first
 *
 * A parser sees the same structure the bundler does, so these stop being
 * spelling questions.
 */

import { join, resolve } from "node:path";

import ts from "typescript";

export const DEFINE_MESSAGE =
  "passes values through Vite's `define`, which substitutes them into the " +
  "emitted bundle as literals. Client config belongs in VITE_-prefixed " +
  "variables read via import.meta.env.";

/** The property name, whatever syntax declares it, or null. */
function propertyName(node) {
  if (ts.isShorthandPropertyAssignment(node)) return node.name.text;
  if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
    const name = node.name;
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
    if (ts.isComputedPropertyName(name) && ts.isStringLiteral(name.expression)) {
      return name.expression.text;
    }
  }
  return null;
}

function isLoadEnvCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const callee = node.expression;
  if (ts.isIdentifier(callee)) return callee.text === "loadEnv";
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text === "loadEnv";
  return false;
}

/**
 * @param {string} path display path for messages
 * @param {string} text vite.config.ts contents
 * @returns {{problems: string[]}}
 */
export function analyzeViteConfig(path, text) {
  const problems = [];
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const at = (node) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    return `${path}:${line + 1}`;
  };

  const visit = (node) => {
    // --- every `define` property, in every declaration form -----------------
    if (ts.isObjectLiteralExpression(node)) {
      for (const prop of node.properties) {
        if (propertyName(prop) === "define") {
          problems.push(`${at(prop)}: ${DEFINE_MESSAGE}`);
        }
        // A spread can carry a `define` this file never spells out.
        if (ts.isSpreadAssignment(prop)) {
          problems.push(
            `${at(prop)}: spreads into a Vite config object, so a \`define\` ` +
              `entry cannot be ruled out statically. Build the config ` +
              `explicitly instead of spreading into it.`,
          );
        }
      }
    }

    // --- every loadEnv call, not just the first ------------------------------
    if (isLoadEnvCall(node)) {
      const prefix = node.arguments[2];
      if (prefix === undefined) {
        problems.push(
          `${at(node)}: calls loadEnv with no prefix argument, which loads ` +
            `every environment variable including server-only secrets. ` +
            `Pass 'VITE_'.`,
        );
      } else if (ts.isStringLiteralLike(prefix)) {
        if (prefix.text === "") {
          problems.push(
            `${at(node)}: calls loadEnv with an empty prefix, which loads ` +
              `every environment variable including server-only secrets. ` +
              `Pass 'VITE_'.`,
          );
        }
      } else if (
        ts.isArrayLiteralExpression(prefix) &&
        prefix.elements.every((e) => ts.isStringLiteralLike(e))
      ) {
        if (prefix.elements.some((e) => e.text === "")) {
          problems.push(
            `${at(node)}: calls loadEnv with an empty prefix in its prefix ` +
              `list, which loads every environment variable. Pass 'VITE_'.`,
          );
        }
      } else {
        // A computed prefix cannot be proven safe, so it is rejected.
        problems.push(
          `${at(node)}: calls loadEnv with a prefix that is not a string ` +
            `literal, so it cannot be proven to exclude server-only secrets. ` +
            `Pass a literal 'VITE_'.`,
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return { problems };
}

/**
 * Statically evaluate a `resolve.alias` target to an absolute path.
 *
 * Only the forms this repository can actually produce are understood. Anything
 * else returns null, and the caller fails closed — an alias whose target cannot
 * be proven is an alias whose modules might silently drop out of the client
 * graph, which is precisely the blind spot this guard exists to prevent.
 *
 * @param {ts.Expression} node
 * @param {string} root repository root
 * @returns {string|null} absolute path, or null if not statically known
 */
function evaluateAliasTarget(node, root) {
  if (ts.isStringLiteralLike(node)) {
    return node.text.startsWith("/") ? node.text : join(root, node.text);
  }

  // path.resolve(...) / path.join(...) over statically known parts.
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    (node.expression.name.text === "resolve" || node.expression.name.text === "join")
  ) {
    const parts = [];
    for (const arg of node.arguments) {
      if (ts.isStringLiteralLike(arg)) {
        parts.push(arg.text);
        continue;
      }
      // process.cwd(), __dirname and import.meta.dirname all denote the root
      // for a config file that lives at the repository root.
      const text = arg.getText().replace(/\s+/g, "");
      if (text === "process.cwd()" || text === "__dirname" || text === "import.meta.dirname") {
        parts.push(root);
        continue;
      }
      return null;
    }
    return parts.length > 0 ? resolve(...parts) : null;
  }

  return null;
}

/**
 * The `resolve.alias` map declared by vite.config.ts.
 *
 * The client module graph must resolve `@/x` the same way the bundler does. It
 * previously hardcoded `@` -> repository root; if someone repointed the alias,
 * aliased imports would stop resolving, those modules would leave the scanned
 * set, and the guard would still pass. So the mapping is read from the config
 * instead of assumed, and an alias that cannot be evaluated is an error.
 *
 * @param {string} path display path for messages
 * @param {string} text vite.config.ts contents
 * @param {string} root repository root
 * @returns {{aliases: Record<string,string>, problems: string[]}}
 */
export function extractAliases(path, text, root) {
  const aliases = {};
  const problems = [];
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      for (const prop of node.properties) {
        if (propertyName(prop) !== "alias" || !ts.isPropertyAssignment(prop)) continue;

        if (!ts.isObjectLiteralExpression(prop.initializer)) {
          problems.push(
            `${path}: resolve.alias is not an object literal, so the set of ` +
              `client-reachable modules cannot be determined statically.`,
          );
          continue;
        }

        for (const entry of prop.initializer.properties) {
          const key = propertyName(entry);
          if (key === null || !ts.isPropertyAssignment(entry)) {
            problems.push(
              `${path}: an entry in resolve.alias is not a plain \`key: value\` ` +
                `pair, so it cannot be followed when walking the client graph.`,
            );
            continue;
          }
          const target = evaluateAliasTarget(entry.initializer, root);
          if (target === null) {
            problems.push(
              `${path}: the target of alias '${key}' is not statically ` +
                `determinable, so modules reached through it would silently ` +
                `leave the scanned set. Use a literal path or ` +
                `path.resolve(process.cwd(), ...).`,
            );
            continue;
          }
          aliases[key] = target;
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return { aliases, problems };
}
