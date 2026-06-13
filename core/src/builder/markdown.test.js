/**
 * Tests for frontmatter splitting and YAML parsing.
 * Covers the delimiter edge cases (CRLF, empty block, missing/EOF body) and
 * the YAML_PARSE_FAILED error path; markdown rendering itself is Bun's job.
 */

import { expect, test } from "bun:test";
import { parseFrontmatter } from "./markdown.js";

const SRC = "pages/post.md";

test("no frontmatter returns content untouched", () => {
	const input = "# Just markdown\n\nbody";
	expect(parseFrontmatter(input, SRC)).toEqual({ meta: {}, markdown: input });
});

test("a --- not at the very start is not a fence", () => {
	// Only a leading "---" opens frontmatter; a thematic break mid-document
	// must survive untouched.
	const input = "intro\n\n---\n\nmore";
	expect(parseFrontmatter(input, SRC)).toEqual({ meta: {}, markdown: input });
});

test("parses a basic LF block and strips it from the body", () => {
	expect(
		parseFrontmatter("---\ntitle: Hello\nlayout: docs\n---\n# Body\n", SRC),
	).toEqual({ meta: { title: "Hello", layout: "docs" }, markdown: "# Body\n" });
});

test("handles CRLF line endings", () => {
	expect(
		parseFrontmatter("---\r\ntitle: Hello\r\n---\r\nbody\r\n", SRC),
	).toEqual({ meta: { title: "Hello" }, markdown: "body\r\n" });
});

test("empty block yields empty meta and full body", () => {
	expect(parseFrontmatter("---\n---\nbody\n", SRC)).toEqual({
		meta: {},
		markdown: "body\n",
	});
});

test("block with no trailing body yields empty markdown", () => {
	expect(parseFrontmatter("---\ntitle: x\n---", SRC)).toEqual({
		meta: { title: "x" },
		markdown: "",
	});
});

test("unterminated block is treated as plain content", () => {
	const input = "---\ntitle: x\nno closing fence\n";
	expect(parseFrontmatter(input, SRC)).toEqual({ meta: {}, markdown: input });
});

test("scalar (non-object) YAML falls back to empty meta", () => {
	expect(parseFrontmatter("---\n42\n---\nbody", SRC)).toEqual({
		meta: {},
		markdown: "body",
	});
});

test("invalid YAML throws YAML_PARSE_FAILED naming the source file", () => {
	let payload;
	try {
		parseFrontmatter("---\ntitle: : :\n---\nbody", SRC);
	} catch (e) {
		payload = /** @type {import("../utils/errors.js").CastroError} */ (e)
			.castroPayload;
	}

	expect(payload).toBeDefined();
	expect(payload?.code).toBe("YAML_PARSE_FAILED");
	expect(payload?.message).toContain(SRC);
});
