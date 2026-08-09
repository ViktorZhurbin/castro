/**
 * Tests for the pieces of the dev server that are pure enough to drive
 * directly: static path resolution, the request handler (including the SSE
 * live-reload transport), the two watcher predicates, and the rebuild
 * debouncer.
 *
 * Nothing here touches the process cwd. `resolveStaticFile` takes its output
 * root as an argument, so a fixture tree needs no `process.chdir()` — which
 * used to be a constraint on the whole suite, not just this file.
 */

import { afterAll, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path/posix";

import {
  broadcast,
  createFetchHandler,
  debounceRebuilds,
  hasFileChanged,
  isIgnored,
  resolveStaticFile,
} from "./server.js";

const root = mkdtempSync(join(tmpdir(), "castro-server-"));
const outputRoot = join(root, "dist");

await Bun.write(join(outputRoot, "index.html"), "<h1>home</h1>");
await Bun.write(join(outputRoot, "about.html"), "<h1>about</h1>");
await Bun.write(join(outputRoot, "blog/index.html"), "<h1>blog</h1>");
await Bun.write(join(outputRoot, "style.css"), "body{}");
await Bun.write(join(outputRoot, "my page.html"), "<h1>spaced</h1>");
await Bun.write(join(outputRoot, "über.html"), "<h1>unicode</h1>");
await Bun.write(join(outputRoot, "404.html"), "<h1>fixture 404</h1>");
await Bun.write(join(root, "dist.html"), "not served");

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** @param {string} pathname */
async function serve(pathname) {
  const file = await resolveStaticFile(pathname, outputRoot);

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

test("the root's sibling is not served when the output dir has no index", async () => {
  // The assertion above passes on candidate order alone — index.html is tried
  // first and wins. Only an output dir without one reaches the containment
  // check, which is the sole reason `/` doesn't serve `dist.html`.
  const indexlessRoot = join(root, "indexless-dist");
  await Bun.write(join(indexlessRoot, "about.html"), "<h1>reachable</h1>");
  await Bun.write(join(root, "indexless-dist.html"), "not served");

  expect(await resolveStaticFile("/", indexlessRoot)).toBeNull();
  // The dir is otherwise live — the null above is the check, not a bad root.
  expect(await (await resolveStaticFile("/about", indexlessRoot))?.text()).toBe(
    "<h1>reachable</h1>",
  );
});

// ------ The request handler ------
// Driven with a bare Request. Going through Bun.serve would mean a buildAll(),
// a bound port, process signal handlers, and four non-terminating watchers.

/**
 * @param {string} pathname
 * @param {HeadersInit} [headers]
 */
function request(pathname, headers) {
  return new Request(`http://localhost${pathname}`, { headers });
}

/** @param {Set<ReadableStreamDefaultController>} [controllers] */
function handler(controllers = new Set()) {
  return createFetchHandler({ controllers, outputRoot });
}

test("a resolved file is served with a 200", async () => {
  const res = await handler()(request("/about"));

  expect(res.status).toBe(200);
  expect(await res.text()).toBe("<h1>about</h1>");
});

test("a navigation miss serves 404.html with a 404 status", async () => {
  const res = await handler()(request("/nope", { accept: "text/html" }));

  expect(res.status).toBe(404);
  // The browser only renders the page if it arrives as HTML, and nothing sets
  // that header — it comes from Bun's extension inference, which is why this
  // pins the exact value (charset included) instead of a substring: a
  // reintroduced explicit "Content-Type: text/html" would pass a substring
  // check too, silently dropping the charset again.
  expect(res.headers.get("content-type")).toBe("text/html;charset=utf-8");
  // Asserted on content, not just status: a 404.html resolved against the cwd
  // rather than outputRoot would still be *a* 404 page on a machine that has
  // one, and this is the only thing that tells them apart.
  expect(await res.text()).toBe("<h1>fixture 404</h1>");
});

test("an asset miss gets the bare 404, not the HTML page", async () => {
  // Browsers probe /favicon.ico on every site; those must not be answered with
  // a page body.
  const res = await handler()(request("/favicon.ico", { accept: "image/*" }));

  expect(res.status).toBe(404);
  expect(await res.text()).toBe("Not Found");
});

test("a request with no Accept header gets the bare 404", async () => {
  const res = await handler()(request("/nope"));

  expect(await res.text()).toBe("Not Found");
});

test("a navigation miss falls back to a bare 404 when no 404.html exists", async () => {
  const bareRoot = join(root, "no-404-page");
  await Bun.write(join(bareRoot, "index.html"), "<h1>home</h1>");

  const res = await createFetchHandler({ controllers: new Set(), outputRoot: bareRoot })(
    request("/nope", { accept: "text/html" }),
  );

  expect(res.status).toBe(404);
  expect(await res.text()).toBe("Not Found");
});

// ------ The SSE live-reload transport ------

test("/events opens an event stream and registers the connection", async () => {
  /** @type {Set<ReadableStreamDefaultController>} */
  const controllers = new Set();
  const res = await handler(controllers)(request("/events"));

  expect(res.headers.get("content-type")).toBe("text/event-stream");
  expect(res.headers.get("cache-control")).toBe("no-cache");
  expect(controllers.size).toBe(1);

  await res.body?.cancel();
});

test("a cancelled event stream drops its connection", async () => {
  /** @type {Set<ReadableStreamDefaultController>} */
  const controllers = new Set();
  const res = await handler(controllers)(request("/events"));

  // What a browser closing the tab does. Left in the set, it would be
  // broadcast to forever.
  await res.body?.cancel();

  expect(controllers.size).toBe(0);
});

test("a broadcast reaches an open connection", async () => {
  /** @type {Set<ReadableStreamDefaultController>} */
  const controllers = new Set();
  const res = await handler(controllers)(request("/events"));

  broadcast(controllers, "data: reload\n\n");

  const reader = /** @type {ReadableStream<Uint8Array>} */ (res.body).getReader();
  const { value } = await reader.read();

  expect(new TextDecoder().decode(value)).toBe("data: reload\n\n");

  await reader.cancel();
});

test("a dead connection is evicted without stopping the others", async () => {
  /** @type {Set<ReadableStreamDefaultController>} */
  const controllers = new Set();

  /** @type {ReadableStreamDefaultController} */
  let deadController;
  new ReadableStream({
    start(controller) {
      deadController = controller;
      controller.close();
    },
  });
  // @ts-expect-error assigned synchronously by start(), above
  controllers.add(deadController);

  const res = await handler(controllers)(request("/events"));
  expect(controllers.size).toBe(2);

  broadcast(controllers, "data: reload\n\n");

  // The live connection still got the message, and the dead one is gone.
  const reader = /** @type {ReadableStream<Uint8Array>} */ (res.body).getReader();
  const { value } = await reader.read();

  expect(new TextDecoder().decode(value)).toBe("data: reload\n\n");
  expect(controllers.size).toBe(1);

  await reader.cancel();
});

// ------ The ignore denylist ------

test("editor temp files and OS metadata are ignored", () => {
  expect(isIgnored("page.tsx~")).toBe(true);
  expect(isIgnored("page.tsx.swp")).toBe(true);
  expect(isIgnored("page.tsx.swo")).toBe(true);
  expect(isIgnored("page.tsx.tmp")).toBe(true);
  expect(isIgnored(".DS_Store")).toBe(true);
  expect(isIgnored("4913")).toBe(true);
});

test("the denylist matches on the basename, not the whole path", () => {
  expect(isIgnored("blog/nested/.DS_Store")).toBe(true);
  // A directory that happens to match must not take its children with it.
  expect(isIgnored("cache.tmp/page.tsx")).toBe(false);
});

test("a real source file is not ignored", () => {
  expect(isIgnored("pages/index.tsx")).toBe(false);
  expect(isIgnored("styles.css")).toBe(false);
});

// ------ The mtime-changed predicate ------
// The macOS-only self-rebuild guard: a rebuild's own reads surface as FSEvents
// change events, so only a moved mtime may schedule another build.

test("a file seen for the first time counts as changed and is recorded", async () => {
  const filePath = join(root, "watched/first.tsx");
  await Bun.write(filePath, "one");

  /** @type {Map<string, number>} */
  const modTimes = new Map();

  expect(await hasFileChanged(modTimes, filePath)).toBe(true);
  expect(modTimes.has(filePath)).toBe(true);
});

test("the same file stat'd twice does not count as changed", async () => {
  const filePath = join(root, "watched/twice.tsx");
  await Bun.write(filePath, "one");

  /** @type {Map<string, number>} */
  const modTimes = new Map();

  expect(await hasFileChanged(modTimes, filePath)).toBe(true);
  // This is the loop: FSEvents reports the rebuild's own read of an untouched
  // file. Without the mtime compare, dev rebuilds forever.
  expect(await hasFileChanged(modTimes, filePath)).toBe(false);
});

test("a moved mtime counts as changed", async () => {
  const filePath = join(root, "watched/touched.tsx");
  await Bun.write(filePath, "one");

  /** @type {Map<string, number>} */
  const modTimes = new Map();
  await hasFileChanged(modTimes, filePath);

  // An explicit mtime rather than a rewrite: the assertion must not depend on
  // filesystem timestamp granularity.
  const later = new Date(Date.now() + 10_000);
  await utimes(filePath, later, later);

  expect(await hasFileChanged(modTimes, filePath)).toBe(true);
});

test("a directory event never counts as changed", async () => {
  const dirPath = join(root, "watched");
  await Bun.write(join(dirPath, "keep.tsx"), "one");

  /** @type {Map<string, number>} */
  const modTimes = new Map();

  // Recursive watchers report the parent dir alongside the file inside it;
  // rebuilding on both doubles every build.
  expect(await hasFileChanged(modTimes, dirPath)).toBe(false);
});

test("a deleted file counts as changed and drops its recorded mtime", async () => {
  const filePath = join(root, "watched/deleted.tsx");
  await Bun.write(filePath, "one");

  /** @type {Map<string, number>} */
  const modTimes = new Map();
  await hasFileChanged(modTimes, filePath);

  rmSync(filePath);

  // Deleting a page has to rebuild, or dist/ keeps serving it.
  expect(await hasFileChanged(modTimes, filePath)).toBe(true);
  expect(modTimes.has(filePath)).toBe(false);
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
