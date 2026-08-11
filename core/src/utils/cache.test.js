/**
 * Tests for the content-hashed filenames that bust Bun's module cache.
 *
 * Bun's loader caches by path and ignores query strings, so the hash is the only
 * thing that makes recompiled code reach a running process. A production build
 * imports each module once, so every other test in the suite stays green with
 * the hash pinned to a constant — while the dev server serves stale modules.
 */

import { afterAll, expect, test } from "bun:test";
import { rmSync } from "node:fs";

import { getModule, resolveCacheDir } from "./cache.js";

// PROJECT_ROOT is the cwd, so these writes land in the same cache tree a real
// `bun run dev` at the repo root uses. The subpath keeps them in a corner this
// file owns and can remove without touching anyone else's compiled modules.
const fixtureSubpath = "cache-test";
const sourceFilePath = "cache.test-fixture.js";

afterAll(() => {
  rmSync(resolveCacheDir(fixtureSubpath), { recursive: true, force: true });
});

test("recompiled content is imported fresh, not served from Bun's path cache", async () => {
  const first = await getModule(sourceFilePath, "export const version = 1;", fixtureSubpath);
  expect(first.version).toBe(1);

  const second = await getModule(sourceFilePath, "export const version = 2;", fixtureSubpath);
  expect(second.version).toBe(2);
});

test("unchanged content resolves to the same cached module", async () => {
  const content = "export const version = 3;";
  const first = await getModule(sourceFilePath, content, fixtureSubpath);

  // Identity, not equality: the hash is over content, so an unchanged rebuild
  // must land on the path Bun already has in memory rather than a new one.
  expect(await getModule(sourceFilePath, content, fixtureSubpath)).toBe(first);
});
