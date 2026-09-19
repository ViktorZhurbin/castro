/**
 * Tests for initTheme(): pre-paint resolution (stored override vs system
 * preference, never writing back when nothing was stored) and the toggle's
 * click handling. Click scenarios mirror the interactive walkthrough at
 * https://lea.verou.me/blog/2026/dark-mode-toggles/ — each comment quotes
 * the step it pins.
 */
import { beforeEach, expect, test } from "bun:test";

import { initTheme } from "./theme";

let theme: string | null;
let store: Map<string, string>;
let systemPrefersDark: boolean;
let clickHandler: (event: { target: unknown }) => void;

const toggle = { closest: (selector: string) => (selector === "#theme-toggle" ? toggle : null) };
const elsewhere = { closest: () => null };

const click = (target: unknown = toggle) => clickHandler({ target });

beforeEach(() => {
  theme = null;
  store = new Map();
  systemPrefersDark = false;

  globalThis.document = {
    addEventListener: (_: string, handler: typeof clickHandler) => {
      clickHandler = handler;
    },
    documentElement: {
      getAttribute: (name: string) => (name === "data-theme" ? theme : null),
      setAttribute: (name: string, value: string) => {
        if (name === "data-theme") theme = value;
      },
    },
  } as unknown as Document;

  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  } as unknown as Storage;

  globalThis.window = {
    matchMedia: () => ({ matches: systemPrefersDark }) as MediaQueryList,
  } as unknown as Window & typeof globalThis;
});

test("no stored preference, system light -> resolves light", () => {
  initTheme();
  expect(theme).toBe("light");
});

test("no stored preference, system dark -> resolves dark", () => {
  systemPrefersDark = true;
  initTheme();
  expect(theme).toBe("dark");
});

test("no stored preference -> does not write one (stays following system)", () => {
  initTheme();
  expect(store.has("theme")).toBe(false);
});

test("stored override wins over system preference and is left untouched", () => {
  systemPrefersDark = true;
  store.set("theme", "light");
  initTheme();
  expect(theme).toBe("light");
  expect(store.get("theme")).toBe("light");
});

test("clicks outside the toggle are ignored", () => {
  initTheme();
  click(elsewhere);
  expect(theme).toBe("light");
  expect(store.has("theme")).toBe(false);
});

test("target differs from system -> stores an explicit override", () => {
  // "You toggle. The target is dark, which is not what the OS says, so
  // the site stores an override. The page goes dark."
  initTheme();
  click();
  expect(theme).toBe("dark");
  expect(store.get("theme")).toBe("dark");
});

test("target matches system -> clears the stored override", () => {
  // "You toggle. The target is light, which is what the OS says, so the
  // override is removed. The page follows the OS again."
  store.set("theme", "dark");
  initTheme();
  click();
  expect(theme).toBe("light");
  expect(store.has("theme")).toBe(false);
});

test("an override that later matches system is kept", () => {
  // "Your OS switches to dark. The override now matches it but is still
  // kept. Nothing visibly happens, which is correct."
  store.set("theme", "dark");
  initTheme();
  systemPrefersDark = true;
  initTheme();
  expect(theme).toBe("dark");
  expect(store.get("theme")).toBe("dark");
});

test("the accidental-pin scenario self-corrects within one extra click", () => {
  initTheme();

  // "You toggle to dark, which is stored as an override."
  click();
  expect(store.get("theme")).toBe("dark");

  // "You toggle again, meaning to pin light. It matches the OS, so the
  // override is removed — you actually got the system default."
  click();
  expect(theme).toBe("light");
  expect(store.has("theme")).toBe(false);

  // "Your OS switches to dark and the page follows. Not what you meant!"
  systemPrefersDark = true;
  initTheme();
  expect(theme).toBe("dark");

  // "But the fix is a single click: light no longer matches the OS, so
  // this time it is an override, and thus pinned."
  click();
  expect(theme).toBe("light");
  expect(store.get("theme")).toBe("light");
});
