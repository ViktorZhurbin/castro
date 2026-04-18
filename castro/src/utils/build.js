import { CastroError } from "./errors.js";

/** @import { CodeFrame } from "../types.d.ts" */

/**
 * Wraps Bun.build to standardize error handling.
 *
 * Bun.build can fail in two shapes. Both paths now emit structured
 * BUNDLE_FAILED errors with code frames extracted from build logs:
 *
 *  - Soft failure: returns `{ success: false, logs: [...] }`
 *  - Hard failure: throws AggregateError with `errors` array
 *
 * @param {Bun.BuildConfig} config
 */
export async function safeBunBuild(config) {
	try {
		const result = await Bun.build(config);

		if (!result.success) {
			const frames = result.logs.map(bunLogToFrame);
			throw new CastroError("BUNDLE_FAILED", undefined, frames);
		}

		return result;
	} catch (error) {
		if (error instanceof AggregateError) {
			const frames = error.errors.map(bunLogToFrame);

			throw new CastroError(
				"BUNDLE_FAILED",
				{ errorMessage: error.message },
				frames,
			);
		}

		throw error;
	}
}

/**
 * Converts a Bun.build log/error entry into a CodeFrame.
 * @param {BuildMessage | ResolveMessage} log
 * @returns {CodeFrame}
 */
export function bunLogToFrame(log) {
	return {
		file: log.position?.file,
		line: log.position?.line,
		column: log.position?.column,
		lineText: log.position?.lineText,
	};
}
