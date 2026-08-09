/**
 * DOM-level tests for the castro-island client runtime: directive branch
 * selection (`waitIdle` / `waitVisible`), the hydrate path, and failure
 * handling on a broken dynamic import. Needs a real DOM, so this registers
 * a happy-dom `Window` on `globalThis` before importing the module under
 * test — `castroIsland.js` reads `document`/`window`/`customElements` as
 * bare globals, exactly as it does in the browser.
 *
 * One `Window` for the whole file: `customElements.define` runs once at
 * import time and is tied to whichever registry was global then, so tests
 * reuse that same document rather than each getting a fresh one.
 */

import { afterAll, afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path/posix";

import { Window } from "happy-dom";

const window = new Window();
Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
});

await import("./castroIsland.js");

const fixturesDir = mkdtempSync(join(tmpdir(), "castro-island-"));

const mountUrl = join(fixturesDir, "mount.js");
await Bun.write(
  mountUrl,
  `export default function mount(el, props) {
     el.setAttribute("data-mounted-with", JSON.stringify(props));
   }`,
);

const notAFunctionUrl = join(fixturesDir, "not-a-function.js");
await Bun.write(notAFunctionUrl, `export default { compiler: "never emits this" };`);

/** @param {Record<string, string>} attrs */
function createIsland(attrs) {
  const el = /** @type {any} */ (document.createElement("castro-island"));
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

/** @type {any[]} */
let observers = [];
class FakeIntersectionObserver {
  /** @param {(entries: { isIntersecting: boolean }[]) => void} callback */
  constructor(callback) {
    this.callback = callback;
    this.disconnected = false;
    observers.push(this);
  }
  observe() {}
  disconnect() {
    this.disconnected = true;
  }
}

/** @type {Parameters<typeof console.error>[]} */
let consoleErrors = [];
const originalConsoleError = console.error;

/** @param {DocumentReadyState} value */
function setReadyState(value) {
  Object.defineProperty(document, "readyState", { value, configurable: true });
}

beforeEach(() => {
  observers = [];
  consoleErrors = [];
  console.error = (...args) => {
    consoleErrors.push(args);
  };
  globalThis.IntersectionObserver = /** @type {any} */ (FakeIntersectionObserver);
  delete (/** @type {any} */ (globalThis).requestIdleCallback);
  delete (/** @type {any} */ (window).requestIdleCallback);
  // One document for the whole file, so readyState has to be reset here rather
  // than left wherever the previous test parked it.
  setReadyState("complete");
});

afterEach(() => {
  console.error = originalConsoleError;
});

afterAll(() => {
  rmSync(fixturesDir, { recursive: true, force: true });
});

// ------ Directive branch selection ------

test("comrade:eager hydrates without waiting", async () => {
  const el = createIsland({ directive: "comrade:eager", import: mountUrl });

  await el.connectedCallback();

  expect(observers).toHaveLength(0);
  expect(el.getAttribute("ready")).toBe("");
});

test("comrade:visible waits for intersection, then hydrates and disconnects the observer", async () => {
  const el = createIsland({ directive: "comrade:visible", import: mountUrl });

  const pending = el.connectedCallback();
  const observer = observers.at(-1);
  expect(observer.disconnected).toBe(false);

  observer.callback([{ isIntersecting: true }]);
  await pending;

  expect(observer.disconnected).toBe(true);
  expect(el.getAttribute("ready")).toBe("");
});

test("a missing directive falls back to comrade:visible", async () => {
  const el = createIsland({ import: mountUrl });

  const pending = el.connectedCallback();
  const observer = observers.at(-1);
  observer.callback([{ isIntersecting: true }]);
  await pending;

  expect(el.getAttribute("ready")).toBe("");
});

test("comrade:patient waits for requestIdleCallback when supported", async () => {
  let idleCalled = false;
  const idle = (/** @type {() => void} */ cb) => {
    idleCalled = true;
    cb();
  };
  globalThis.requestIdleCallback = /** @type {any} */ (idle);
  /** @type {any} */ (window).requestIdleCallback = idle;

  const el = createIsland({ directive: "comrade:patient", import: mountUrl });
  await el.connectedCallback();

  expect(idleCalled).toBe(true);
  expect(el.getAttribute("ready")).toBe("");
});

test("comrade:patient hydrates immediately when requestIdleCallback is unsupported", async () => {
  const el = createIsland({ directive: "comrade:patient", import: mountUrl });
  await el.connectedCallback();

  expect(el.getAttribute("ready")).toBe("");
});

test("comrade:patient waits for the load event when the document isn't ready yet", async () => {
  setReadyState("loading");

  const el = createIsland({ directive: "comrade:patient", import: mountUrl });
  const pending = el.connectedCallback();

  expect(el.getAttribute("ready")).toBeNull();
  window.dispatchEvent(new window.Event("load"));
  await pending;

  expect(el.getAttribute("ready")).toBe("");
});

// ------ hydrate() ------

test("hydrate mounts the module with parsed props", async () => {
  const el = createIsland({
    directive: "comrade:eager",
    import: mountUrl,
    "data-props": JSON.stringify({ initial: 5 }),
  });

  await el.connectedCallback();

  expect(el.getAttribute("data-mounted-with")).toBe(JSON.stringify({ initial: 5 }));
});

test("hydrate defaults to an empty props object when data-props is absent", async () => {
  const el = createIsland({ directive: "comrade:eager", import: mountUrl });

  await el.connectedCallback();

  expect(el.getAttribute("data-mounted-with")).toBe(JSON.stringify({}));
});

test("a hydrated island is never mounted a second time", async () => {
  const el = createIsland({ directive: "comrade:eager", import: mountUrl });

  await el.connectedCallback();
  el.removeAttribute("data-mounted-with");
  await el.connectedCallback();

  expect(el.getAttribute("data-mounted-with")).toBeNull();
});

// Pins connectedCallback's own guard, not hydrate()'s: the assertion above stays
// green with it deleted, because hydrate() returns early either way. What only
// this guard prevents is re-entering the wait path — a second observer, a second
// load listener — on an element that already hydrated.
test("connectedCallback doesn't re-enter the wait path once hydrated", async () => {
  const el = createIsland({ directive: "comrade:visible", import: mountUrl });

  const pending = el.connectedCallback();
  observers.at(-1).callback([{ isIntersecting: true }]);
  await pending;

  // Deliberately not awaited: without the guard this waits on an observer that
  // nothing will ever fire, and awaiting it would hang the file instead of failing.
  void el.connectedCallback();

  expect(observers).toHaveLength(1);
});

// ------ Failure handling ------

test("a failed dynamic import logs an error and never sets ready", async () => {
  const el = createIsland({
    directive: "comrade:eager",
    import: join(fixturesDir, "does-not-exist.js"),
  });

  await el.connectedCallback();

  expect(el.getAttribute("ready")).toBeNull();
  expect(consoleErrors[0]?.[0]).toContain("hydration failed");
});

test("a failed hydration is never retried", async () => {
  const el = createIsland({
    directive: "comrade:eager",
    import: join(fixturesDir, "does-not-exist.js"),
  });

  await el.connectedCallback();
  await el.hydrate();

  expect(consoleErrors).toHaveLength(1);
});

// The message assertion is the test: without it, deleting the guard outright
// still passes, because import(null) throws into the same catch and logs once.
test("a missing import attribute logs an error instead of throwing", async () => {
  const el = createIsland({ directive: "comrade:eager" });

  await el.connectedCallback();

  expect(el.getAttribute("ready")).toBeNull();
  expect(consoleErrors[0]?.[0]).toContain("missing import attribute");
});

test("a module without a mounting function logs an error and never claims ready", async () => {
  const el = createIsland({ directive: "comrade:eager", import: notAFunctionUrl });

  await el.connectedCallback();

  expect(el.getAttribute("ready")).toBeNull();
  expect(consoleErrors[0]?.[0]).toContain("must export mounting function");
});
