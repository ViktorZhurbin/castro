/**
 * DOM-level tests for the live-reload client: the SSE message handlers and
 * the error overlay they drive. `EventSource` is stubbed rather than real —
 * these tests exercise the payload → shadow-DOM rendering, not the network
 * transport. `showOverlay`/`removeOverlay` aren't exported; dispatching a
 * synthetic `build-error` event reaches them the same way the server would.
 */

import { beforeEach, expect, test } from "bun:test";

import { Window } from "happy-dom";

/** @typedef {import("../types.d.ts").CastroErrorPayload} CastroErrorPayload */

class FakeEventSource {
  /** @param {string} url */
  constructor(url) {
    this.url = url;
    /** @type {Record<string, ((event: any) => void)[]>} */
    this.listeners = {};
    /** @type {((event: any) => void) | null} */
    this.onmessage = null;
    FakeEventSource.instances.push(this);
  }
  /**
   * @param {string} type
   * @param {(event: any) => void} callback
   */
  addEventListener(type, callback) {
    (this.listeners[type] ??= []).push(callback);
  }
  /**
   * @param {string} type
   * @param {any} event
   */
  dispatch(type, event) {
    if (type === "message") this.onmessage?.(event);
    for (const callback of this.listeners[type] ?? []) callback(event);
  }
}
/** @type {FakeEventSource[]} */
FakeEventSource.instances = [];

const window = new Window();
Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  CSSStyleSheet: window.CSSStyleSheet,
  EventSource: FakeEventSource,
});

await import("./liveReload.js");

const eventSource = FakeEventSource.instances[0];

/** @param {Partial<CastroErrorPayload>} overrides */
function buildErrorEvent(overrides = {}) {
  /** @type {CastroErrorPayload} */
  const payload = { code: "UNEXPECTED", title: "Something broke", ...overrides };
  return { data: JSON.stringify(payload) };
}

function overlay() {
  return document.querySelector("castro-error-overlay");
}

let reloaded = false;

beforeEach(() => {
  overlay()?.remove();
  reloaded = false;
  window.location.reload = () => {
    reloaded = true;
  };
});

test("a build-error event mounts the overlay with every field rendered", () => {
  eventSource.dispatch(
    "build-error",
    buildErrorEvent({
      title: "Route conflict",
      message: "Two pages resolve to the same path",
      errorMessage: "raw stack trace here",
      notes: ["pages/a.tsx", "pages/b.tsx"],
      hint: "Rename one of the routes",
      frames: [
        {
          file: "/project/pages/a.tsx",
          line: 3,
          column: 5,
          lineText: "export const title = 'a'",
          message: "defined here",
        },
      ],
    }),
  );

  const html = overlay()?.shadowRoot?.innerHTML ?? "";

  expect(html).toContain("Route conflict");
  expect(html).toContain("Two pages resolve to the same path");
  expect(html).toContain("raw stack trace here");
  expect(html).toContain("pages/a.tsx");
  expect(html).toContain("pages/b.tsx");
  expect(html).toContain("Rename one of the routes");
  expect(html).toContain("defined here");
  expect(html).toContain("export const title = 'a'");
  expect(html).toContain("pages/a.tsx:3:5");
  // The link keeps the absolute path the editor needs, while the text is trimmed
  // to the scan root — the two diverge on purpose.
  expect(html).toContain('href="vscode://file//project/pages/a.tsx:3:5"');
  // Column 5 is 1-based, so the caret sits after four spaces.
  expect(html).toContain(`<div class="caret">${" ".repeat(4)}^</div>`);
});

test("a frame without a file renders a bare line location and no link", () => {
  eventSource.dispatch("build-error", buildErrorEvent({ frames: [{ line: 12, column: 4 }] }));

  const html = overlay()?.shadowRoot?.innerHTML ?? "";

  expect(html).toContain("Line 12:4");
  expect(html).not.toContain("<a ");
});

test("a second build-error replaces the overlay instead of stacking", () => {
  eventSource.dispatch("build-error", buildErrorEvent({ title: "First error" }));
  eventSource.dispatch("build-error", buildErrorEvent({ title: "Second error" }));

  expect(document.querySelectorAll("castro-error-overlay")).toHaveLength(1);
  expect(overlay()?.shadowRoot?.innerHTML).toContain("Second error");
});

test("overlay content is HTML-escaped", () => {
  eventSource.dispatch("build-error", buildErrorEvent({ title: "<script>alert(1)</script>" }));

  const html = overlay()?.shadowRoot?.innerHTML ?? "";

  expect(html).not.toContain("<script>alert(1)</script>");
  expect(html).toContain("&lt;script&gt;");
});

test("a reload message removes the overlay and reloads the page", () => {
  eventSource.dispatch("build-error", buildErrorEvent());
  expect(overlay()).not.toBeNull();

  eventSource.dispatch("message", { data: "reload" });

  expect(overlay()).toBeNull();
  expect(reloaded).toBe(true);
});
