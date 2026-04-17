/**
 * Terminal error renderer. Converts structured CastroErrorPayload into
 * a colorful, scannable error message for the terminal using styleText.
 * No regex, no string parsing — pure structure-to-string.
 */

import { styleText } from "node:util";

/** @import { CastroErrorPayload, CodeFrame } from "../types.d.ts"; */

/**
 * @param {CastroErrorPayload} payload
 * @returns {string}
 */
export function renderErrorToTerminal(payload) {
	const lines = [];

	// Title: red, bold, with ❌ prefix
	lines.push(styleText("red", `❌ ${payload.title}`));

	// Message: primary explanation
	if (payload.message) {
		lines.push(`   ${payload.message}`);
	}

	// Notes: bulleted list (if present)
	if (payload.notes && payload.notes.length > 0) {
		lines.push("");
		for (const note of payload.notes) {
			lines.push(styleText("gray", `   · ${note}`));
		}
	}

	// Code frames: source location with context
	if (payload.frames && payload.frames.length > 0) {
		for (const frame of payload.frames) {
			lines.push("");
			lines.push(renderFrame(frame));
		}
	}

	// Hint: actionable footer (if present)
	if (payload.hint) {
		lines.push("");
		lines.push(styleText("yellow", `   → ${payload.hint}`));
	}

	return lines.join("\n");
}

/**
 * Renders a single code frame with line numbers and caret.
 * @param {CodeFrame} frame
 * @returns {string}
 */
function renderFrame(frame) {
	const lines = [];

	// File location: gray, concise
	const location = formatLocation(frame);
	lines.push(styleText("gray", `   ${location}`));

	// Code snippet (if lineText is available)
	if (frame.lineText) {
		const lineNum = frame.line || 0;
		const lineStr = String(lineNum);
		const padding = 3; // show 1 before, 1 after, 1 current
		const start = Math.max(1, lineNum - padding);
		const end = lineNum + padding;

		// Display 3 lines of context (before, error, after)
		const beforeLineNum = lineNum - 1;
		const afterLineNum = lineNum + 1;

		// Show before line
		if (beforeLineNum >= start) {
			const beforeText = `   ${String(beforeLineNum).padStart(lineStr.length)}  ${frame.lineText}`;
			lines.push(styleText("gray", beforeText));
		}

		// Show error line with highlight and caret
		const errLinePrefix = styleText("red", `   > ${lineNum}`);
		lines.push(`${errLinePrefix}  ${frame.lineText}`);

		// Caret under the error column
		if (frame.column !== undefined) {
			const caretPad = " ".repeat(frame.column);
			const caret = styleText("red", "^");
			lines.push(`       ${caretPad}${caret}`);
		}

		// Show after line
		if (afterLineNum <= end) {
			const afterText = `   ${String(afterLineNum).padStart(lineStr.length)}  ${frame.lineText}`;
			lines.push(styleText("gray", afterText));
		}
	}

	return lines.join("\n");
}

/**
 * Formats a file location as "file:line:column"
 * @param {CodeFrame} frame
 * @returns {string}
 */
function formatLocation(frame) {
	let location = frame.file;
	if (frame.line !== undefined) {
		location += `:${frame.line}`;
		if (frame.column !== undefined) {
			location += `:${frame.column}`;
		}
	}
	return location;
}
