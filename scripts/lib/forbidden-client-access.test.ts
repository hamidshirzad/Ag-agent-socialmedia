import { describe, it, expect } from "vitest";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

import {
  FORBIDDEN_ALIASES,
  FORBIDDEN_REF,
  SENTINELS,
  SERVER_CREDENTIALS,
  scanArtifactBytes,
  scanSource,
} from "./forbidden-client-access.mjs";

const ROOT = resolve(__dirname, "..", "..");
const problemsIn = (code: string) => scanSource("fixture.ts", code).problems;

/**
 * Run `fn` against a temporary fixture file and always remove it, even when an
 * assertion throws. No adversarial mutation may survive a failing test run.
 */
function withFixture(contents: string, fn: (path: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "client-secret-fixture-"));
  const path = join(dir, "fixture.ts");
  try {
    writeFileSync(path, contents);
    fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("source guard — adversarial access forms", () => {
  // Every one of these spells the credential somewhere, which is exactly why
  // the guard matches names rather than chasing syntax.
  const bypasses: ReadonlyArray<readonly [string, string]> = [
    ["dot", "const k = process.env.GEMINI_API_KEY;"],
    ["double-quoted bracket", 'const k = process.env["GEMINI_API_KEY"];'],
    ["single-quoted bracket", "const k = process.env['GEMINI_API_KEY'];"],
    ["optional chaining", "const k = process.env?.GEMINI_API_KEY;"],
    ["optional chaining on both", "const k = process?.env?.GEMINI_API_KEY;"],
    ["destructuring", "const { GEMINI_API_KEY } = process.env;"],
    ["destructuring with rename", "const { GEMINI_API_KEY: k } = process.env;"],
    ["alias variable", "const env = process.env; const k = env.GEMINI_API_KEY;"],
    ["import.meta dot", "const k = import.meta.env.GEMINI_API_KEY;"],
    ["import.meta bracket", 'const k = import.meta.env["GEMINI_API_KEY"];'],
    ["import.meta single-quoted", "const k = import.meta.env['GEMINI_API_KEY'];"],
    ["import.meta destructuring", "const { GEMINI_API_KEY } = import.meta.env;"],
    ["typescript cast, full root", "const k = (process.env as any).GEMINI_API_KEY;"],
    ["typescript cast, mid root", "const k = (import.meta as any).env.GEMINI_API_KEY;"],
    ["VITE alias, dot", "const k = import.meta.env.VITE_GEMINI_API_KEY;"],
    ["VITE alias, bracket", 'const k = import.meta.env["VITE_GEMINI_API_KEY"];'],
    ["VITE alias, destructuring", "const { VITE_GEMINI_API_KEY } = import.meta.env;"],
    ["VITE alias, cast", "const k = (import.meta as any).env.VITE_GEMINI_API_KEY;"],
  ];

  it.each(bypasses)("rejects %s", (_label, code) => {
    expect(problemsIn(code), code).not.toHaveLength(0);
  });

  it.each(SERVER_CREDENTIALS)("rejects the server credential %s", (name) => {
    expect(problemsIn(`const k = process.env.${name};`)).not.toHaveLength(0);
    expect(problemsIn(`const { ${name} } = process.env;`)).not.toHaveLength(0);
  });

  it.each(FORBIDDEN_ALIASES)("rejects the browser-visible alias %s", (alias) => {
    const problems = problemsIn(`const k = import.meta.env.${alias};`);
    expect(problems, alias).not.toHaveLength(0);
    expect(problems[0]).toContain(alias);
  });

  it("covers every alias named in the security requirements", () => {
    expect(FORBIDDEN_ALIASES).toEqual(
      expect.arrayContaining([
        "VITE_GEMINI_API_KEY",
        "VITE_ANTHROPIC_API_KEY",
        "VITE_OPENAI_API_KEY",
        "VITE_STRIPE_SECRET_KEY",
        "VITE_STRIPE_WEBHOOK_SECRET",
        "VITE_FIREBASE_SERVICE_ACCOUNT",
        "VITE_DATABASE_URL",
      ]),
    );
  });

  it("rejects a credential named only inside a comment", () => {
    // Deliberately conservative: a reworded comment is cheaper than a leak.
    expect(problemsIn("// TODO: wire up GEMINI_API_KEY here")).not.toHaveLength(0);
  });

  it("reads fixtures from disk the way the scanner does", () => {
    withFixture('const k = import.meta.env["VITE_GEMINI_API_KEY"];', (path) => {
      const found = scanSource(path, readFileSync(path, "utf8")).problems;
      expect(found).not.toHaveLength(0);
    });
  });
});

describe("source guard — legitimate configuration is allowed", () => {
  it("allows public Firebase browser configuration", () => {
    // VITE_FIREBASE_API_KEY is published by design and is a different thing
    // from FIREBASE_SERVICE_ACCOUNT. Its value shape is never inspected.
    const code = `
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
        projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
    `;
    expect(problemsIn(code)).toHaveLength(0);
  });

  it("allows an AIza-shaped literal, judging names and never values", () => {
    expect(
      problemsIn('const k = "AIzaSyBExampleNotARealKeyShapedLikeOne00000";'),
    ).toHaveLength(0);
  });

  it("allows the VITE_ values this app actually uses", () => {
    expect(
      problemsIn("const l = import.meta.env.VITE_CALENDLY_BOOKING_LINK;"),
    ).toHaveLength(0);
  });

  it("does not reject a VITE_ name merely for ending in API_KEY", () => {
    expect(problemsIn("import.meta.env.VITE_PUBLIC_MAPS_API_KEY")).toHaveLength(0);
  });
});

describe("source guard — warnings stay warnings", () => {
  it("reports a non-credential client process.env read without failing", () => {
    const code = "const k = (process.env as any).API_KEY;";
    const { problems, warnings } = scanSource("videoService.ts", code);
    expect(problems).toHaveLength(0);
    expect(warnings.join()).toContain("API_KEY");
  });
});

describe("output guard — byte scanning", () => {
  it("finds the server credential canary in emitted JavaScript", () => {
    const js = `const t=e||"${SENTINELS.GEMINI_API_KEY}";`;
    expect(scanArtifactBytes("dist/app.js", Buffer.from(js))).not.toHaveLength(0);
  });

  it("finds a forbidden VITE alias canary in emitted JavaScript", () => {
    const js = `const t="${SENTINELS.VITE_GEMINI_API_KEY}";`;
    const found = scanArtifactBytes("dist/app.js", Buffer.from(js));
    expect(found).not.toHaveLength(0);
    expect(found[0]).toContain("VITE_GEMINI_API_KEY");
  });

  it.each(FORBIDDEN_ALIASES)("has a distinct canary for %s", (alias) => {
    const others = Object.entries(SENTINELS).filter(([n]) => n !== alias);
    expect(others.some(([, c]) => c === SENTINELS[alias])).toBe(false);
    const found = scanArtifactBytes("dist/app.js", Buffer.from(SENTINELS[alias]));
    expect(found, alias).not.toHaveLength(0);
  });

  it("finds a canary planted in a source map", () => {
    const map = JSON.stringify({
      version: 3,
      sources: ["../src/x.ts"],
      sourcesContent: [`const k = "${SENTINELS.VITE_GEMINI_API_KEY}";`],
    });
    expect(scanArtifactBytes("dist/app.js.map", Buffer.from(map))).not.toHaveLength(0);
  });

  it("finds a canary planted in a binary artifact", () => {
    const binary = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0xff]),
      Buffer.from(SENTINELS.GEMINI_API_KEY, "utf8"),
      Buffer.from([0x00, 0xfe]),
    ]);
    expect(scanArtifactBytes("dist/logo.png", binary)).not.toHaveLength(0);
  });

  it("finds the literal server-environment reference", () => {
    expect(
      scanArtifactBytes("dist/app.js", Buffer.from(`x=${FORBIDDEN_REF}`)),
    ).not.toHaveLength(0);
  });

  it("passes a clean artifact", () => {
    expect(scanArtifactBytes("dist/app.js", Buffer.from("const t=e;"))).toEqual([]);
  });

  it("uses canaries that are not key-shaped", () => {
    for (const canary of Object.values(SENTINELS)) {
      expect(canary).not.toMatch(/^AIza/);
      expect(canary).toContain("CANARY_DO_NOT_SHIP");
    }
  });
});

describe("the repository itself", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((e) => {
      const full = join(dir, e);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });

  it("is clean: no forbidden credential name anywhere in src/", () => {
    const problems = walk(join(ROOT, "src"))
      .filter((f) => /\.(ts|tsx|js|jsx)$/.test(f))
      .flatMap((f) => scanSource(relative(ROOT, f), readFileSync(f, "utf8")).problems);
    expect(problems).toEqual([]);
  });

  it("still warns about the pre-existing videoService read", () => {
    const warnings = scanSource(
      "src/services/videoService.ts",
      readFileSync(join(ROOT, "src/services/videoService.ts"), "utf8"),
    ).warnings;
    expect(warnings.join()).toContain("API_KEY");
  });
});
