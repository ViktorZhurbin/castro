/**
 * Tests for the two pieces of the dev server that are pure enough to drive
 * directly: static path resolution and the rebuild debouncer.
 *
 * Both the chdir into a temp dist/ tree and the import below run at module
 * scope, not in beforeAll: server.js resolves OUTPUT_DIR against the cwd at
 * import. The process-global chdir is safe only because Bun runs one test file
 * at a time, loading the next after this one's afterAll restores the cwd.
 */

import { afterAll, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path/posix";

const originalCwd = process.cwd();
const root = mkdtempSync(join(tmpdir(), "castro-server-"));

process.chdir(root);

await Bun.write(join(root, "dist/index.html"), "<h1>home</h1>");
await Bun.write(join(root, "dist/about.html"), "<h1>about</h1>");
await Bun.write(join(root, "dist/blog/index.html"), "<h1>blog</h1>");
await Bun.write(join(root, "dist/style.css"), "body{}");
await Bun.write(join(root, "dist/my page.html"), "<h1>spaced</h1>");
await Bun.write(join(root, "dist/über.html"), "<h1>unicode</h1>");
await Bun.write(join(root, "dist.html"), "not served");

const { debounceRebuilds, resolveStaticFile } = await import("./server.js");

afterAll(() => {
  process.chdir(originalCwd);
  rmSync(root, { recursive: true, force: true });
});

/** @param {string} pathname */
async function serve(pathname) {
  const file = await resolveStaticFile(pathname);

  return file && (await file.text());
}

// ------ Clean URLs ------

test("root path resolves to index.html", async () => {
  expect(await serve("/")).toBe("<h1>home</h1>");
});

test("clean URL resolves to the sibling .html file", async () => {
  expect(await serve("/about")).toBe("<h1>about</h1>");
});

test("clean URL falls back to a directory index", async () => {
  expect(await serve("/blog")).toBe("<h1>blog</h1>");
});

test("trailing slash resolves to the directory index", async () => {
  expect(await serve("/blog/")).toBe("<h1>blog</h1>");
});

test("an extension is served at its exact path", async () => {
  expect(await serve("/style.css")).toBe("body{}");
});

test("a miss resolves to null so the caller can 404", async () => {
  expect(await serve("/nope")).toBeNull();
});

// ------ Percent-decoding ------
// A file whose name needs encoding in a URL must still resolve, or dev
// disagrees with every real static host.

test("percent-encoded space resolves", async () => {
  expect(await serve("/my%20page")).toBe("<h1>spaced</h1>");
});

test("percent-encoded non-ASCII resolves", async () => {
  expect(await serve("/%C3%BCber")).toBe("<h1>unicode</h1>");
});

test("the root's sibling is not a candidate for the root itself", async () => {
  // The clean-URL candidate derived from "/" is `dist.html`, a sibling of the
  // output dir; only the index inside dist/ may answer.
  expect(await serve("/")).not.toBe("not served");
});

// ------ Debounced rebuilds ------

test("rapid schedules collapse into a single run", async () => {
  let runs = 0;
  const rebuild = debounceRebuilds(async () => {
    runs++;
  }, 5);

  rebuild.schedule();
  rebuild.schedule();
  rebuild.schedule();

  await Bun.sleep(40);
  expect(runs).toBe(1);
});

test("a schedule during an in-flight run triggers exactly one more run", async () => {
  let runs = 0;
  /** @type {(() => void) | undefined} */
  let release;
  const firstRunStarted = Promise.withResolvers();

  const rebuild = debounceRebuilds(async () => {
    runs++;
    if (runs === 1) {
      firstRunStarted.resolve(undefined);
      await new Promise((r) => {
        release = () => r(undefined);
      });
    }
  }, 5);

  rebuild.schedule();
  await firstRunStarted.promise;

  // Arrives while the first run is still going.
  rebuild.schedule();
  await Bun.sleep(20);
  expect(runs).toBe(1); // still blocked — builds must not overlap

  release?.();
  await Bun.sleep(40);
  expect(runs).toBe(2);
});
