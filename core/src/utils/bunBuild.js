import { CastroError } from "./errors.js";

/** @import { CodeFrame } from "../types.d.ts" */

/**
 * Wraps Bun.build to standardize error handling.
 *
 * Bun.build can fail in two shapes. Both paths will emit structured
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
			const errorMessage = error.message;
			const frames = error.errors.map(bunLogToFrame);

			throw new CastroError("BUNDLE_FAILED", { errorMessage }, frames);
		}

		throw error;
	}
}

/**
 * Converts a Bun.build log/error entry into a CodeFrame.
 * @param {BuildMessage | ResolveMessage} log
 * @returns {CodeFrame}
 */
function bunLogToFrame(log) {
	const position = log.position;

	return {
		file: position?.file,
		line: position?.line,
		// Bun/esbuild columns are 0-based; normalize to 1-based here so the
		// displayed location, the vscode:// link, and both caret renderers all
		// share the editor convention. Renderers subtract 1 for the 0-based offset.
		column: position ? position.column + 1 : undefined,
		lineText: position?.lineText,
	};
}
