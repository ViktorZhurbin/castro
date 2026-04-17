/**
 * Error building and normalization utilities. Transforms thrown values into
 * structured payloads consumed by terminal and browser renderers.
 * Decouples structure (data) from voice (messages/*.js).
 */

import { messages } from "../messages/index.js";

/** @import { ErrorCode, CodeFrame, CastroErrorPayload } from "../types.d.ts" */

export class CastroError extends Error {
	/**
	 * @param {ErrorCode} code
	 * @param {Record<string, string | string[]>} [tokens]
	 * @param {CodeFrame[]} [frames]
	 */
	constructor(code, tokens = {}, frames = []) {
		const errorDef = messages.errors[code];

		if (!errorDef) throw new Error(`Unknown error code: ${code}`);

		const errorContent =
			typeof errorDef === "function" ? errorDef(tokens) : errorDef;

		super(errorContent.title);

		/** @type {CastroErrorPayload} */
		this.castroPayload = { code, frames, ...errorContent };
		this.name = "CastroError";

		// Optional: explicitly strip the constructor from the stack trace
		// (Bun/V8 specific, makes it even cleaner)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CastroError);
		}
	}
}

/**
 * Normalizes any thrown value into a payload.
 * Preserves .castroPayload when present; wraps others as UNEXPECTED.
 * @param {unknown} err
 * @returns {CastroErrorPayload}
 */
export function toPayload(err) {
	if (err instanceof CastroError) {
		return err.castroPayload;
	}

	const message = err instanceof Error ? err.message : String(err);

	return {
		code: "UNEXPECTED",
		title: "Unexpected error",
		message,
		frames: [],
	};
}
