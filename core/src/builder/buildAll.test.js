/**
 * Tests for toRoute()'s index-spelling collapse.
 * scanPages() keys route-conflict detection on this function's output, so a
 * broken collapse doesn't just mis-render a URL — it lets `pages/blog.tsx`
 * and `pages/blog/index.tsx` both build and leaves the host to pick one.
 */

import { expect, test } from "bun:test";

import { toRoute } from "./buildAll.js";

test("index.html at the root collapses to /", () => {
  expect(toRoute("index.html")).toBe("/");
});

test("a plain page keeps its path", () => {
  expect(toRoute("about.html")).toBe("/about");
});

test("dir/index.html collapses to the directory's own URL", () => {
  expect(toRoute("blog/index.html")).toBe("/blog");
});

test("dir.html collapses to the same URL as dir/index.html", () => {
  expect(toRoute("blog.html")).toBe("/blog");
});

test("a nested dir/index.html collapses one level up, not to root", () => {
  expect(toRoute("docs/api/index.html")).toBe("/docs/api");
});

// "index" only collapses as a whole final path segment — the regex anchors on
// `(^|\/)index$`, so a filename that merely ends in those letters, or an
// "index" segment that isn't last, must survive untouched.

test('a filename that ends in "index" but isn\'t the segment "index" is not collapsed', () => {
  expect(toRoute("indexes.html")).toBe("/indexes");
});

test('an "index" segment that isn\'t the final one is not collapsed', () => {
  expect(toRoute("index/foo.html")).toBe("/index/foo");
});
