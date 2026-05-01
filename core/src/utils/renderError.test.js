/**
 * Tests for the terminal error renderer.
 * Focus: structural assertions (caret alignment, frame skipping) that
 * golden-file tests can't catch when source happens to have leading whitespace.
 */

import { test } from "bun:test";
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
	const caretLine = lines[lines.indexOf(/** @type {string} */ (codeLine)) + 1];

	if (!codeLine || !caretLine) throw new Error("Missing code/caret lines");

	const caretIdx = caretLine.indexOf("^");
	const firstCharIdx = codeLine.indexOf("abc");

	if (caretIdx !== firstCharIdx) {
		throw new Error(
			`Caret at ${caretIdx}, first char at ${firstCharIdx} — expected match`,
		);
	}
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
	if (out.includes("\n\n\n")) {
		throw new Error("Empty frame produced spurious blank lines");
	}
});

test("snippet is skipped when lineText is present but line number is missing", () => {
	const out = stripAnsi(
		renderErrorToTerminal({
			code: "BUNDLE_FAILED",
			title: "x",
			frames: [{ file: "/a.ts", lineText: "abc" }],
		}),
	);

	if (out.includes("> 0") || out.includes("abc")) {
		throw new Error("Snippet rendered without a line number");
	}
});
