/**
 * Tests for themeInit()'s pre-paint theme resolution: reading a stored
 * override vs falling back to system preference, and — the regression this
 * file exists to pin — never writing a value back when nothing was stored.
 */
import { beforeEach, expect, test } from "bun:test";

import { DARK, LIGHT, STORAGE_KEY } from "./constants";
import { themeInit } from "./themeInit";

let theme: string | null;
let store: Map<string, string>;
let systemPrefersDark: boolean;

beforeEach(() => {
  theme = null;
  store = new Map();
  systemPrefersDark = false;

  globalThis.document = {
    documentElement: {
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
  systemPrefersDark = false;
  themeInit(STORAGE_KEY, DARK, LIGHT);
  expect(theme).toBe(LIGHT);
});

test("no stored preference, system dark -> resolves dark", () => {
  systemPrefersDark = true;
  themeInit(STORAGE_KEY, DARK, LIGHT);
  expect(theme).toBe(DARK);
});

test("no stored preference -> does not write one (stays following system)", () => {
  systemPrefersDark = false;
  themeInit(STORAGE_KEY, DARK, LIGHT);
  expect(store.has(STORAGE_KEY)).toBe(false);
});

test("stored override wins over system preference", () => {
  systemPrefersDark = false;
  store.set(STORAGE_KEY, DARK);
  themeInit(STORAGE_KEY, DARK, LIGHT);
  expect(theme).toBe(DARK);
});

test("stored override is left untouched", () => {
  systemPrefersDark = true;
  store.set(STORAGE_KEY, LIGHT);
  themeInit(STORAGE_KEY, DARK, LIGHT);
  expect(theme).toBe(LIGHT);
  expect(store.get(STORAGE_KEY)).toBe(LIGHT);
});
