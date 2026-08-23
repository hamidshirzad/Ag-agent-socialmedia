import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  FORBIDDEN_REF,
  REQUIRED_FLOOR,
  aliasesFor,
  credentialsForRoot,
  deriveServerCredentials,
  scanArtifactBytes,
  scanSource,
  sentinelsFor,
} from "./forbidden-client-access.mjs";
import { analyzeViteConfig } from "./vite-config-analysis.mjs";
import { collectClientModules } from "./client-module-graph.mjs";
import { validateSources } from "./validate-sources.mjs";

const ROOT = resolve(__dirname, "..", "..");
const CREDENTIALS = credentialsForRoot(ROOT);
const problemsIn = (code: string) => scanSource("fixture.ts", code, CREDENTIALS).problems;

/** Always removes the fixture, even when an assertion throws. */
function withTempRepo(files: Record<string, string>, fn: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), "guard-fixture-"));
  try {
    for (const [rel, contents] of Object.entries(files)) {
      const full = join(root, rel);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, contents);
    }
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ───────────────────────────── finding 1 ─────────────────────────────
describe("finding 1 — every server credential is protected", () => {
  // Codex: "a client reference such as import.meta.env.VITE_LINKEDIN_CLIENT_SECRET
  // passes both layers". These are the five it named.
  const previouslyMissed = [
    "LINKEDIN_CLIENT_SECRET",
    "FACEBOOK_CLIENT_SECRET",
    "X_CLIENT_SECRET",
    "TIKTOK_CLIENT_SECRET",
    "PAYPAL_CLIENT_SECRET",
  ];

  it.each(previouslyMissed)("rejects %s and its VITE_ alias", (name) => {
    expect(CREDENTIALS).toContain(name);
    expect(problemsIn(`const k = process.env.${name};`)).not.toHaveLength(0);
    expect(problemsIn(`const k = import.meta.env.VITE_${name};`)).not.toHaveLength(0);
  });

  it("arms a canary for every credential and alias", () => {
    const sentinels = sentinelsFor(CREDENTIALS);
    for (const name of [...CREDENTIALS, ...aliasesFor(CREDENTIALS)]) {
      expect(sentinels[name], name).toBeTruthy();
    }
    // Distinct canaries, so a hit names the exact variable.
    const values = Object.values(sentinels);
    expect(new Set(values).size).toBe(values.length);
  });

  it("derives the denylist from .env.example, not a frozen list", () => {
    const derived = deriveServerCredentials("NEW_PROVIDER_SECRET=\nVITE_PUBLIC_THING=\n");
    expect(derived).toContain("NEW_PROVIDER_SECRET");
    expect(derived).not.toContain("VITE_PUBLIC_THING");
    for (const floor of REQUIRED_FLOOR) expect(derived).toContain(floor);
  });

  it("keeps public client configuration out of the denylist", () => {
    // Client IDs and Firebase browser config are published by design.
    for (const publicName of [
      "VITE_FIREBASE_API_KEY",
      "VITE_LINKEDIN_CLIENT_ID",
      "VITE_PAYPAL_CLIENT_ID",
      "VITE_STRIPE_PUBLISHABLE_KEY",
      "VITE_CALENDLY_BOOKING_LINK",
    ]) {
      expect(problemsIn(`import.meta.env.${publicName}`), publicName).toHaveLength(0);
    }
    expect(CREDENTIALS).not.toContain("APP_URL");
  });
});

// ───────────────────────────── finding 3 ─────────────────────────────
describe("finding 3 — every loadEnv call is inspected", () => {
  const analyze = (code: string) => analyzeViteConfig("vite.config.ts", code).problems;

  it("rejects an unsafe call that FOLLOWS a safe one", () => {
    // The exact bypass: String.match only ever saw the first call.
    const code = `const a = loadEnv(mode, '.', 'VITE_');\nconst b = loadEnv(mode, '.', '');`;
    expect(analyze(code)).not.toHaveLength(0);
  });

  it("accepts multiple safe calls", () => {
    const code = `const a = loadEnv(mode, '.', 'VITE_');\nconst b = loadEnv(mode, '.', 'VITE_');`;
    expect(analyze(code)).toHaveLength(0);
  });

  it.each([
    ["double-quoted empty prefix", `loadEnv(mode, ".", "")`],
    ["single-quoted empty prefix", `loadEnv(mode, '.', '')`],
    ["omitted prefix", `loadEnv(mode, '.')`],
    ["multiline call", `loadEnv(\n  mode,\n  '.',\n  ''\n)`],
    ["empty prefix inside a list", `loadEnv(mode, '.', ['VITE_', ''])`],
  ])("rejects %s", (_label, code) => {
    expect(analyze(code), code).not.toHaveLength(0);
  });

  it("rejects a prefix it cannot prove safe", () => {
    expect(analyze(`const p = cond ? '' : 'VITE_'; loadEnv(mode, '.', p);`)).not.toHaveLength(0);
  });
});

// ───────────────────────────── finding 6 ─────────────────────────────
describe("finding 6 — every define property form is rejected", () => {
  const analyze = (code: string) => analyzeViteConfig("vite.config.ts", code).problems;

  it.each([
    ["unquoted", `export default { define: { a: 1 } };`],
    ["double-quoted", `export default { "define": { a: 1 } };`],
    ["single-quoted", `export default { 'define': { a: 1 } };`],
    ["computed string", `export default { ["define"]: { a: 1 } };`],
    ["shorthand", `const define = { a: 1 }; export default { define };`],
    ["nested in a returned config", `export default defineConfig(() => ({ plugins: [], define: {} }));`],
  ])("rejects a %s define property", (_label, code) => {
    expect(analyze(code), code).not.toHaveLength(0);
  });

  it("rejects a spread it cannot prove free of define", () => {
    expect(analyze(`export default { ...base, plugins: [] };`)).not.toHaveLength(0);
  });

  it("accepts the current config shape", () => {
    const real = readFileSync(join(ROOT, "vite.config.ts"), "utf8");
    expect(analyzeViteConfig("vite.config.ts", real).problems).toHaveLength(0);
  });
});

// ───────────────────────────── finding 5 ─────────────────────────────
describe("finding 5 — client-reachable modules outside src/ are scanned", () => {
  it("follows an @/ alias to a root-level module and rejects it", () => {
    withTempRepo(
      {
        "index.html": `<script type="module" src="/src/main.tsx"></script>`,
        "vite.config.ts": `export default { resolve: { alias: { "@": "." } } };`,
        ".env.example": "GEMINI_API_KEY=\n",
        "src/main.tsx": `import { cfg } from "@/shared/config";\nconsole.log(cfg);`,
        // Root-level, outside src/ — invisible to the old scanner.
        "shared/config.ts": `export const cfg = process.env.GEMINI_API_KEY;`,
      },
      (root) => {
        const { modules } = collectClientModules(root);
        expect(modules.some((f) => f.endsWith("shared/config.ts"))).toBe(true);
        const { problems } = validateSources(root);
        expect(problems.join("\n")).toContain("GEMINI_API_KEY");
      },
    );
  });

  it("follows a relative import out of src/", () => {
    withTempRepo(
      {
        "index.html": `<script type="module" src="/src/main.tsx"></script>`,
        "vite.config.ts": `export default {};`,
        ".env.example": "STRIPE_SECRET_KEY=\n",
        "src/main.tsx": `import "../lib/helper";`,
        "lib/helper.ts": `export const k = process.env.STRIPE_SECRET_KEY;`,
      },
      (root) => {
        expect(validateSources(root).problems.join("\n")).toContain("STRIPE_SECRET_KEY");
      },
    );
  });

  it("does NOT scan server-only modules the client never imports", () => {
    // server.ts legitimately reads secrets. Flagging it would train everyone
    // to ignore the guard.
    withTempRepo(
      {
        "index.html": `<script type="module" src="/src/main.tsx"></script>`,
        "vite.config.ts": `export default {};`,
        ".env.example": "STRIPE_SECRET_KEY=\n",
        "src/main.tsx": `console.log("hello");`,
        "server.ts": `const k = process.env.STRIPE_SECRET_KEY;`,
      },
      (root) => {
        expect(validateSources(root).problems).toEqual([]);
      },
    );
  });

  it("does not pass vacuously when there is no entry point", () => {
    withTempRepo(
      { "vite.config.ts": `export default {};`, ".env.example": "" },
      (root) => {
        expect(validateSources(root).problems.join("\n")).toContain("entry point");
      },
    );
  });
});

// ─────────────────────── access forms (regression) ───────────────────
describe("source guard — adversarial access forms", () => {
  it.each([
    ["dot", "const k = process.env.GEMINI_API_KEY;"],
    ["double-quoted bracket", 'const k = process.env["GEMINI_API_KEY"];'],
    ["single-quoted bracket", "const k = process.env['GEMINI_API_KEY'];"],
    ["optional chaining", "const k = process?.env?.GEMINI_API_KEY;"],
    ["destructuring", "const { GEMINI_API_KEY } = process.env;"],
    ["alias variable", "const env = process.env; const k = env.GEMINI_API_KEY;"],
    ["import.meta dot", "const k = import.meta.env.GEMINI_API_KEY;"],
    ["import.meta bracket", 'const k = import.meta.env["GEMINI_API_KEY"];'],
    ["VITE alias", "const k = import.meta.env.VITE_GEMINI_API_KEY;"],
    ["VITE alias bracket", 'const k = import.meta.env["VITE_GEMINI_API_KEY"];'],
    ["typescript cast", "const k = (import.meta as any).env.VITE_GEMINI_API_KEY;"],
    ["comment only", "// TODO: wire up GEMINI_API_KEY"],
  ])("rejects %s", (_label, code) => {
    expect(problemsIn(code), code).not.toHaveLength(0);
  });

  it("allows an AIza-shaped literal, judging names and never values", () => {
    expect(problemsIn('const k = "AIzaSyBExampleNotARealKeyShapedLikeOne00000";')).toHaveLength(0);
  });
});

// ───────────────────────── output guard ──────────────────────────────
describe("output guard — byte scanning", () => {
  const sentinels = sentinelsFor(CREDENTIALS);

  it("finds a credential canary in emitted JavaScript", () => {
    const js = `const t="${sentinels.GEMINI_API_KEY}";`;
    expect(scanArtifactBytes("dist/app.js", Buffer.from(js), sentinels)).not.toHaveLength(0);
  });

  it("finds a newly protected alias canary", () => {
    const js = `const t="${sentinels.VITE_LINKEDIN_CLIENT_SECRET}";`;
    const found = scanArtifactBytes("dist/app.js", Buffer.from(js), sentinels);
    expect(found).not.toHaveLength(0);
    expect(found[0]).toContain("VITE_LINKEDIN_CLIENT_SECRET");
  });

  it("finds a canary planted in a source map", () => {
    const map = JSON.stringify({
      version: 3,
      sources: ["../src/x.ts"],
      sourcesContent: [`const k = "${sentinels.VITE_GEMINI_API_KEY}";`],
    });
    expect(scanArtifactBytes("dist/app.js.map", Buffer.from(map), sentinels)).not.toHaveLength(0);
  });

  it("finds a canary planted in a binary artifact", () => {
    const binary = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]),
      Buffer.from(sentinels.STRIPE_SECRET_KEY, "utf8"),
      Buffer.from([0x00]),
    ]);
    expect(scanArtifactBytes("dist/logo.png", binary, sentinels)).not.toHaveLength(0);
  });

  it("finds the literal server-environment reference", () => {
    expect(
      scanArtifactBytes("dist/app.js", Buffer.from(`x=${FORBIDDEN_REF}`), sentinels),
    ).not.toHaveLength(0);
  });

  it("passes a clean artifact and uses no key-shaped canary", () => {
    expect(scanArtifactBytes("dist/app.js", Buffer.from("const t=e;"), sentinels)).toEqual([]);
    for (const canary of Object.values(sentinels)) {
      expect(canary).not.toMatch(/^AIza/);
      expect(canary).toContain("CANARY_DO_NOT_SHIP");
    }
  });
});

// ───────────────────────────── finding 4 ─────────────────────────────
describe("finding 4 — runs on the repository's supported Node range", () => {
  // `import.meta.dirname` landed in Node 20.11. The repo declares no narrower
  // engine and Vite supports Node 18, so using it made the guard unrunnable on
  // an otherwise supported install. server.ts already uses fileURLToPath.
  const scripts = [
    "scripts/check-client-secrets.mjs",
    "scripts/validate-client-config.mjs",
  ];

  it.each(scripts)("%s does not evaluate import.meta.dirname", (rel) => {
    const text = readFileSync(join(ROOT, rel), "utf8");
    const code = text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toContain("import.meta.dirname");
    expect(code).toContain("fileURLToPath(import.meta.url)");
  });

  it.each(scripts)("%s resolves the repository root correctly", (rel) => {
    // Same computation the script performs, verified to land on the repo root.
    const scriptPath = join(ROOT, rel);
    const derived = resolve(dirname(scriptPath), "..");
    expect(derived).toBe(ROOT);
    expect(readFileSync(join(derived, "package.json"), "utf8")).toContain("test:client-secrets");
  });
});

// ───────────────────────── the repository ────────────────────────────
describe("the repository itself", () => {
  it("passes source and config validation", () => {
    expect(validateSources(ROOT).problems).toEqual([]);
  });

  it("still warns about the pre-existing videoService read", () => {
    expect(validateSources(ROOT).warnings.join()).toContain("API_KEY");
  });

  it("scans a client module graph that excludes server.ts", () => {
    const { scanned } = validateSources(ROOT);
    expect(scanned.length).toBeGreaterThan(10);
    expect(scanned).not.toContain("server.ts");
  });
});
