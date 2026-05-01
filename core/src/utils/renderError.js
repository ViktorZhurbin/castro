/**
 * Terminal error renderer. Converts structured CastroErrorPayload into
 * a colorful, scannable error message for the terminal using styleText.
 * No regex, no string parsing — pure structure-to-string.
 */

import { styleText } from "node:util";

/** @import { CastroErrorPayload, CodeFrame } from "../types.d.ts"; */

const COLORS = /** @type {const} */ ({
	title: "red",
	rawError: "redBright",
	note: "gray",
	location: "gray",
	lineNumber: "red",
	caret: "red",
	hint: "yellow",
});

const LINE_MARKER = "   > ";
const LINE_SEPARATOR = "  ";

/**
 * @param {CastroErrorPayload} payload
 * @returns {string}
 */
export function renderErrorToTerminal(payload) {
	const lines = [];

	lines.push(styleText(COLORS.title, `❌ ${payload.title}`));

	if (payload.message) {
		lines.push(`   ${payload.message}`);
	}

	if (payload.errorMessage) {
		lines.push("", styleText(COLORS.rawError, `   ${payload.errorMessage}`));
	}

	if (payload.notes && payload.notes.length > 0) {
		const notes = payload.notes.map((note) =>
			styleText(COLORS.note, `   · ${note}`),
		);

		lines.push("", ...notes);
	}

	if (payload.frames && payload.frames.length > 0) {
		for (const frame of payload.frames) {
			const frameLines = renderFrame(frame);

			if (frameLines) {
				lines.push("", ...frameLines);
			}
		}
	}

	if (payload.hint) {
		lines.push("", styleText(COLORS.hint, `   → ${payload.hint}`));
	}

	return lines.join("\n");
}

/**
 * Renders a single code frame with line numbers and caret.
 * Returns null when the frame has nothing to display.
 * @param {CodeFrame} frame
 * @returns {string[] | null}
 */
function renderFrame(frame) {
	const lines = [];

	const location = formatLocation(frame);
	if (location) {
		lines.push(styleText(COLORS.location, `   ${location}`));
	}

	// Skip the snippet if we have no line number to anchor it to —
	// rendering "> 0  <code>" would be misleading.
	if (frame.lineText && frame.line !== undefined) {
		const lineNum = frame.line;
		const errLinePrefix = styleText(
			COLORS.lineNumber,
			`${LINE_MARKER}${lineNum}`,
		);
		lines.push(`${errLinePrefix}${LINE_SEPARATOR}${frame.lineText}`);

		// Bun's position.column is 1-based; subtract 1 so column 1 lands
		// directly under the first character of lineText.
		if (frame.column !== undefined) {
			const prefixWidth =
				LINE_MARKER.length + String(lineNum).length + LINE_SEPARATOR.length;
			const caretPad = " ".repeat(prefixWidth + frame.column - 1);
			lines.push(`${caretPad}${styleText(COLORS.caret, "^")}`);
		}
	}

	return lines.length ? lines : null;
}

/**
 * Formats a file location as "file:line:column"
 * @param {CodeFrame} frame
 * @returns {string | undefined}
 */
function formatLocation(frame) {
	if (!frame.file && frame.line === undefined) return undefined;

	let location = frame.file || "";
	if (frame.line !== undefined) {
		location += location ? `:${frame.line}` : `Line ${frame.line}`;

		if (frame.column !== undefined) {
			location += `:${frame.column}`;
		}
	}

	return location || undefined;
}
