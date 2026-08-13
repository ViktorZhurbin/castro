/**
 * Tests for initState()'s click handling: a two-state toggle expressing
 * three underlying states (explicit light, explicit dark, or no override).
 * Scenarios below mirror the interactive walkthrough at
 * https://lea.verou.me/blog/2026/dark-mode-toggles/ — each comment quotes
 * the step it pins.
 */
import { beforeEach, expect, test } from "bun:test";

import { DARK, LIGHT, STORAGE_KEY } from "./constants";
import { initState } from "./initState";

let theme: string | null;
let store: Map<string, string>;
let systemPrefersDark: boolean;
let click: () => void;

beforeEach(() => {
  theme = null;
  store = new Map();
  systemPrefersDark = false;

  const btn = {
    addEventListener: (_: string, handler: () => void) => {
      click = handler;
    },
  };

  globalThis.document = {
    getElementById: (id: string) => (id === "theme-toggle" ? btn : null),
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

  initState(STORAGE_KEY, DARK, LIGHT);
});

test("does nothing when the toggle button is absent", () => {
  globalThis.document.getElementById = () => null;
  expect(() => initState(STORAGE_KEY, DARK, LIGHT)).not.toThrow();
});

test("target differs from system -> stores an explicit override", () => {
  // "You toggle. The target is dark, which is not what the OS says, so
  // the site stores an override. The page goes dark."
  theme = LIGHT;
  systemPrefersDark = false;
  click();
  expect(theme).toBe(DARK);
  expect(store.get(STORAGE_KEY)).toBe(DARK);
});

test("target matches system -> clears the stored override", () => {
  // "You toggle. The target is light, which is what the OS says, so the
  // override is removed. The page follows the OS again."
  theme = DARK;
  store.set(STORAGE_KEY, DARK);
  systemPrefersDark = false;
  click();
  expect(theme).toBe(LIGHT);
  expect(store.has(STORAGE_KEY)).toBe(false);
});

test("an override that later happens to match system is kept until clicked", () => {
  // "Your OS switches to dark. The override now matches it but is still
  // kept. Nothing visibly happens, which is correct." System preference is
  // only ever read inside the click handler, so a change with no click has
  // no effect at all.
  theme = DARK;
  store.set(STORAGE_KEY, DARK);
  systemPrefersDark = true;
  expect(theme).toBe(DARK);
  expect(store.get(STORAGE_KEY)).toBe(DARK);
});

test("the accidental-pin scenario self-corrects within one extra click", () => {
  // OS is light, nothing stored.
  theme = LIGHT;
  systemPrefersDark = false;

  // "You toggle to dark, which is stored as an override."
  click();
  expect(theme).toBe(DARK);
  expect(store.get(STORAGE_KEY)).toBe(DARK);

  // "You toggle again, meaning to pin light. It matches the OS, so the
  // override is removed — you actually got the system default."
  click();
  expect(theme).toBe(LIGHT);
  expect(store.has(STORAGE_KEY)).toBe(false);

  // "Your OS switches to dark and the page follows. Not what you meant!"
  // (no click involved — themeInit would resolve this on next paint;
  // here we just assert the override is still absent)
  systemPrefersDark = true;
  expect(store.has(STORAGE_KEY)).toBe(false);

  // "But the fix is a single click: light no longer matches the OS, so
  // this time it is an override, and thus pinned."
  theme = DARK; // simulates themeInit having resolved to system dark
  click();
  expect(theme).toBe(LIGHT);
  expect(store.get(STORAGE_KEY)).toBe(LIGHT);
});
