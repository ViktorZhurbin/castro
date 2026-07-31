/**
 * Tests for head-tag injection.
 *
 * The interesting cases are the ones a built site can't easily show: a layout
 * with no anchor to inject into, and a page with nothing to inject — both
 * still have to come out with a doctype and the tags intact.
 */

import { expect, test } from "bun:test";
import { injectTags } from "./writeHtmlPage.js";

const TAG = '<link rel="stylesheet" href="/a.css">';

test("tags land before </head> so CSS stays render-blocking", () => {
	const html = injectTags("<html><head><title>x</title></head></html>", [TAG]);

	expect(html).toContain(`${TAG}\n</head>`);
});

test("tags fall back to </body> when the layout has no head", () => {
	const html = injectTags("<html><body><p>x</p></body></html>", [TAG]);

	expect(html).toContain(`${TAG}\n</body>`);
});

test("a shell-less layout still gets its tags", () => {
	const html = injectTags("<p>no shell at all</p>", [TAG]);

	expect(html).toContain(TAG);
	expect(html).toContain("<p>no shell at all</p>");
});

test("an uppercase </HEAD> still anchors the injection", () => {
	const html = injectTags("<HTML><HEAD></HEAD></HTML>", [TAG]);

	expect(html).toContain(`${TAG}\n</HEAD>`);
});

test("head wins over body when both are present", () => {
	const html = injectTags("<head></head><body></body>", [TAG]);

	expect(html.indexOf(TAG)).toBeLessThan(html.indexOf("<body>"));
});

test("multiple tags keep their order", () => {
	const html = injectTags("<head></head>", ["<b>1</b>", "<b>2</b>"]);

	expect(html).toContain("<b>1</b>\n<b>2</b>\n</head>");
});

// ------ Doctype ------

test("a doctype is prepended when the layout omits one", () => {
	expect(injectTags("<html></html>", [])).toStartWith("<!DOCTYPE html>\n");
});

test("an existing doctype is not duplicated", () => {
	const html = injectTags("<!DOCTYPE html>\n<html></html>", [TAG]);

	expect(html.match(/<!DOCTYPE/gi)).toHaveLength(1);
});

test("an existing doctype is recognized in any case or after whitespace", () => {
	const html = injectTags("\n  <!doctype HTML>\n<html></html>", []);

	expect(html.match(/<!doctype/gi)).toHaveLength(1);
});

test("no tags still yields a doctype", () => {
	// Unreachable in dev (live reload always pushes a tag) but the normal
	// case for a static production page with no CSS.
	expect(injectTags("<html></html>", [])).toBe(
		"<!DOCTYPE html>\n<html></html>",
	);
});
