import { buildError, bunLogToFrame } from "./errors.js";

/**
 * Wraps Bun.build to standardize error handling.
 *
 * Bun.build can fail in two shapes. Both paths now emit structured
 * BUNDLE_FAILED errors with code frames extracted from build logs:
 *
 *  - Soft failure: returns `{ success: false, logs: [...] }`
 *  - Hard failure: throws AggregateError with `errors` array
 *
 * @param {import("bun").BuildConfig} config
 */
export async function safeBunBuild(config) {
	try {
		const result = await Bun.build(config);

		if (!result.success) {
			const frames = result.logs.map(bunLogToFrame);
			throw buildError("BUNDLE_FAILED", {}, frames);
		}

		return result;
	} catch (error) {
		if (error instanceof AggregateError) {
			const frames = error.errors.map(bunLogToFrame);
			throw buildError("BUNDLE_FAILED", {}, frames);
		}

		throw error;
	}
}
