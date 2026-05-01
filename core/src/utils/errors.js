/**
 * Error building and normalization utilities. Transforms thrown values into
 * structured payloads consumed by terminal and browser renderers.
 * Decouples structure (data) from voice (messages/*.js).
 */

import { messages } from "../messages/index.js";

/** @import { ErrorCode, ErrorTokens, CodeFrame, CastroErrorPayload } from "../types.d.ts" */

export class CastroError extends Error {
	/** @type {CastroErrorPayload} */
	castroPayload;

	/**
	 * @param {ErrorCode} code
	 * @param {ErrorTokens[ErrorCode]} [tokens]
	 * @param {CodeFrame[]} [frames]
	 */
	constructor(code, tokens, frames = []) {
		const errorFn = messages.errors[code];

		if (!errorFn) {
			throw new Error(`Unknown error code: ${code}`);
		}

		const errorContent = errorFn(/** @type {never} */ (tokens));

		super(errorContent.title);

		this.name = "CastroError";
		this.castroPayload = { ...errorContent, code, frames };

		// Makes stack traces point to the throw site, not this constructor.
		Error.captureStackTrace(this, CastroError);
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

	return {
		code: "UNEXPECTED",
		title: "Unexpected error",
		frames: [],
		message: err instanceof Error ? err.message : String(err),
	};
}
