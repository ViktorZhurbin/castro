/**
 * Error building and normalization utilities. Transforms thrown values into
 * structured payloads consumed by terminal and browser renderers.
 * Decouples structure (data) from voice (messages/*.js).
 */

import { messages } from "../messages/index.js";

/** @import { ErrorCode, CodeFrame, CastroErrorPayload } from "../types.d.ts" */

/** @typedef {Error & { castroPayload: CastroErrorPayload }} CastroError */

/**
 * @param {unknown} err
 * @returns {err is CastroError}
 */
function isCastroError(err) {
	return (
		err instanceof Error &&
		"castroPayload" in err &&
		typeof err.castroPayload === "object" &&
		err.castroPayload !== null
	);
}

/**
 * @param {ErrorCode} code
 * @param {Record<string, string | string[]>} [tokens]
 * @param {CodeFrame[]} [frames]
 * @returns {CastroError}
 */
export function buildError(code, tokens = {}, frames = []) {
	const errorDef = messages.errors[code];

	if (!errorDef) {
		throw new Error(`Unknown error code: ${code}`);
	}

	const errorContent =
		typeof errorDef === "function" ? errorDef(tokens) : errorDef;

	/** @type {CastroErrorPayload} */
	const payload = { code, frames, ...errorContent };

	const err = new Error(payload.title);

	return /** @type {CastroError} */ (
		Object.assign(err, { castroPayload: payload })
	);
}

/**
 * Normalizes any thrown value into a payload.
 * Preserves .castroPayload when present; wraps others as UNEXPECTED.
 * @param {unknown} err
 * @returns {CastroErrorPayload}
 */
export function toPayload(err) {
	if (isCastroError(err)) {
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

/**
 * Converts a Bun.build log/error entry into a CodeFrame.
 * @param {BuildMessage | ResolveMessage} log
 * @returns {CodeFrame}
 */
export function bunLogToFrame(log) {
	return {
		file: log.position?.file || "unknown",
		line: log.position?.line,
		column: log.position?.column,
		lineText: log.position?.lineText,
	};
}
