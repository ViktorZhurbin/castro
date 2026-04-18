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
			const frameStr = renderFrame(frame);

			if (frameStr.length) {
				lines.push("");
				lines.push(frameStr);
			}
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

	if (location) {
		lines.push(styleText("gray", `   ${location}`));
	}

	// Code snippet (if lineText is available)
	if (frame.lineText) {
		const lineNum = frame.line || 0;

		// Show error line with highlight
		const LINE_MARKER = "   > ";
		const LINE_SEPARATOR = "  ";
		const errLinePrefix = styleText("red", `${LINE_MARKER}${lineNum}`);
		lines.push(`${errLinePrefix}${LINE_SEPARATOR}${frame.lineText}`);

		// Caret under the error column
		if (frame.column !== undefined) {
			const prefixOffset = LINE_MARKER.length + String(lineNum).length + LINE_SEPARATOR.length;
			const caretPad = " ".repeat(prefixOffset + frame.column);
			const caret = styleText("red", "^");
			lines.push(`${caretPad}${caret}`);
		}
	}

	return lines.join("\n");
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
