/**
 * Preact Range Guard
 *
 * Root CLAUDE.md's peer-dependency rule (every package.json must pin the
 * same preact range as core/, or two resolved copies break hooks at SSR)
 * isn't enforced by the build — this converts it into a failing assertion.
 */

import { expect, test } from "bun:test";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..");

test("every package.json pins the same preact range as core's peer dependency", async () => {
  const corePkg = await Bun.file(join(repoRoot, "core/package.json")).json();
  const expectedRange = corePkg.peerDependencies?.preact;

  expect(expectedRange).toBeTruthy();
  // core's own devDependencies entry is the smallest possible drift — two
  // copies of preact inside the package that defines the peer contract.
  expect(corePkg.devDependencies?.preact).toBe(expectedRange);

  // scanSync doesn't skip node_modules or dist on its own, and both grow
  // package.json files this repo doesn't own — filtered out below instead.
  const glob = new Bun.Glob("**/package.json");
  /** @type {string[]} */
  const mismatches = [];
  /** @type {string[]} */
  const scanned = [];

  for (const relativePath of glob.scanSync(repoRoot)) {
    const segments = relativePath.split("/");
    if (segments.includes("node_modules") || segments.includes("dist")) {
      continue;
    }
    scanned.push(relativePath);

    const pkg = await Bun.file(join(repoRoot, relativePath)).json();
    const ranges = [
      pkg.dependencies?.preact,
      pkg.devDependencies?.preact,
      pkg.peerDependencies?.preact,
    ];

    for (const range of ranges) {
      if (range !== undefined && range !== expectedRange) {
        mismatches.push(`${relativePath}: ${range}`);
      }
    }
  }

  expect(mismatches).toEqual([]);
  // The scaffolder template is the likeliest manifest to drift (nothing
  // installs or type-checks it) and to fall out of the scan — named here so
  // a narrowed glob can't pass this test by matching nothing.
  expect(scanned).toContain("packages/create-castro/template/package.json");
});
