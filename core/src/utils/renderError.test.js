/**
 * Tests for the terminal error renderer.
 * Focus: structural assertions (caret alignment, frame skipping) that
 * golden-file tests can't catch when source happens to have leading whitespace.
 */

import { expect, test } from "bun:test";
import { renderErrorToTerminal } from "./renderError.js";

/**
 * Strips ANSI escape sequences so assertions can match plain characters.
 * @param {string} s
 */
function stripAnsi(s) {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI
	return s.replace(/\x1b\[[0-9;]*m/g, "");
}

test("caret lands directly under the first character when column is 1", () => {
	const out = stripAnsi(
		renderErrorToTerminal({
			code: "BUNDLE_FAILED",
			title: "x",
			frames: [
				{
					file: "/a.ts",
					line: 1,
					column: 1,
					lineText: "abc",
				},
			],
		}),
	);

	const lines = out.split("\n");
	const codeLine = lines.find((l) => l.includes("> 1"));

	expect(codeLine).toBeDefined();
	// `find` types its result as possibly undefined; narrow for tsc since
	// `indexOf` below needs a definite string.
	if (!codeLine) throw new Error("unreachable");

	const caretLine = lines[lines.indexOf(codeLine) + 1];
	expect(caretLine).toBeDefined();

	const caretIdx = /** @type {string} */ (caretLine).indexOf("^");
	const firstCharIdx = codeLine.indexOf("abc");

	expect(caretIdx).toBe(firstCharIdx);
});

test("frame with neither file nor line is skipped silently", () => {
	const out = stripAnsi(
		renderErrorToTerminal({
			code: "BUNDLE_FAILED",
			title: "x",
			frames: [{}],
		}),
	);

	// Should not contain a stray blank-line gutter for the empty frame.
	expect(out).not.toContain("\n\n\n");
});

test("snippet is skipped when lineText is present but line number is missing", () => {
	const out = stripAnsi(
		renderErrorToTerminal({
			code: "BUNDLE_FAILED",
			title: "x",
			frames: [{ file: "/a.ts", lineText: "abc" }],
		}),
	);

	expect(out).not.toContain("> 0");
	expect(out).not.toContain("abc");
});
