/**
 * srcDir Output Contract Verifier
 *
 * Pins that `srcDir` only shifts where sources are read from — output always
 * lands under dist/ with no srcDir segment. tests/site/ uses the default
 * srcDir: "." and can't catch a leak; this is the minimal srcDir: "src"
 * fixture that can, covering both layout CSS and the separate outputDir/
 * publicDir derivation in islands/registry.js (a leak there 404s the bundle).
 *
 * Usage: bun test:site
 */

import { beforeAll, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const siteDir = import.meta.dir;
const distDir = join(siteDir, "dist");

beforeAll(() => {
  execSync("bun run build", { cwd: siteDir, stdio: "inherit" });
});

test("layout CSS is emitted at /layouts/, not srcDir-prefixed", async () => {
  const html = await Bun.file(join(distDir, "index.html")).text();

  expect(html).toContain('href="/layouts/default.css"');
  expect(html).not.toContain("/src/");
});

test("layout CSS file is written to dist/layouts/, not dist/src/layouts/", async () => {
  expect(await Bun.file(join(distDir, "layouts", "default.css")).exists()).toBe(true);
  expect(await Bun.file(join(distDir, "src", "layouts", "default.css")).exists()).toBe(false);
});

// registry.js derives an island's outputDir/publicDir from COMPONENTS_DIR
// (srcDir-prefixed) independently of the layout CSS path above — this is the
// one other place a srcDir segment could leak into an emitted URL.
test("island bundle URL is emitted at /islands/, not srcDir-prefixed", async () => {
  const html = await Bun.file(join(distDir, "index.html")).text();

  expect(html).toContain('import="/islands/');
  expect(html).not.toContain('import="/src/');
});

// Confirms the URL the HTML references and the file on disk agree — a test
// that only greps the HTML for absence of "/src/" would still pass if the
// island bundle stopped being written at all.
test("island bundle file exists at the emitted URL, and dist/src/ does not exist", async () => {
  const html = await Bun.file(join(distDir, "index.html")).text();
  const importPath = html.match(/import="([^"]+)"/)?.[1];

  expect(importPath).toBeDefined();
  expect(await Bun.file(join(distDir, importPath ?? "")).exists()).toBe(true);
  expect(existsSync(join(distDir, "src"))).toBe(false);
});
