/**
 * srcDir Output Contract Verifier
 *
 * Pins that `srcDir` only shifts where sources are read from — output always
 * lands under dist/ with no srcDir segment. tests/site/ uses the default
 * srcDir: "." for which layout CSS already resolves to the right place, so it
 * cannot catch a srcDir leak. This site is the minimal fixture that can:
 * srcDir: "src" with a layout that imports CSS.
 *
 * Usage: bun test:site
 */

import { beforeAll, expect, test } from "bun:test";
import { execSync } from "node:child_process";
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
