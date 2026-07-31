/**
 * Error building and normalization utilities. Transforms thrown values into
 * structured payloads consumed by terminal and browser renderers.
 * Decouples structure (data) from voice (messages/).
 */

import { messages } from "../messages/index.js";

/** @import { ErrorCode, ErrorTokens, CodeFrame, ErrorContent, CastroErrorPayload } from "../types.d.ts" */

/** @template {ErrorCode} C */
export class CastroError extends Error {
	/** @type {CastroErrorPayload} */
	castroPayload;

	/**
	 * `C` is inferred from `code`, pinning `tokens` to that one code's shape —
	 * without it, another code's tokens type-check here and fail at runtime.
	 *
	 * @param {C} code
	 * @param {ErrorTokens[C]} tokens
	 * @param {CodeFrame[]} [frames]
	 */
	constructor(code, tokens, frames = []) {
		// TypeScript can't correlate the indexed factory with the indexed token
		// type through a type parameter, so it widens this call to an intersection
		// of every code's tokens. The cast restores the pairing the signature
		// already checked at the throw site.
		const factory = /** @type {(tokens: ErrorTokens[C]) => ErrorContent} */ (
			messages.errors[code]
		);
		const errorContent = factory(tokens);

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
 *
 * The raw text goes in `errorMessage`, not `message`: `message` is Castro's own
 * one-line explanation, and both renderers style the two differently.
 *
 * @param {unknown} err
 * @returns {CastroErrorPayload}
 */
export function toPayload(err) {
	if (err instanceof CastroError) {
		return err.castroPayload;
	}

	return {
		...messages.errors.UNEXPECTED(),
		code: "UNEXPECTED",
		frames: [],
		errorMessage: err instanceof Error ? err.message : String(err),
	};
}
