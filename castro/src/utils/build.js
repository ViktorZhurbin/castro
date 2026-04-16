import { messages } from "../messages/index.js";

/**
 * Wraps Bun.build to standardize error formatting.
 *
 * Bun.build can fail in two shapes and we normalize both into a single
 * pre-formatted Error that callers can surface directly to the terminal
 * or the dev-server overlay:
 *
 *  - Soft failure: returns `{ success: false, logs: [...] }`. We throw
 *    inside the try so the catch path handles formatting uniformly.
 *  - Hard failure: throws an AggregateError whose `errors` array carries
 *    the same BuildMessage/ResolveMessage entries as `result.logs`.
 *
 * Anything else caught here (unrelated runtime errors, or the Error we
 * already wrapped above) is re-thrown untouched so stack traces and
 * already-formatted messages aren't clobbered.
 *
 * @param {import("bun").BuildConfig} config
 */
export async function safeBunBuild(config) {
	try {
		const result = await Bun.build(config);

		if (!result.success) {
			throw new Error(
				messages.build.bundleFailed(formatBunBuildErrors(result.logs)),
			);
		}

		return result;
	} catch (error) {
		if (error instanceof AggregateError) {
			const formattedErrors = formatBunBuildErrors(error.errors);

			throw new Error(messages.build.bundleFailed(formattedErrors));
		}

		throw error;
	}
}

/**
 * Format Bun.build logs or AggregateError.errors into a readable string.
 * Each entry uses position.file, line, column, and lineText when available.
 *
 * @param {Array<BuildMessage | ResolveMessage>} errors
 * @returns {string}
 */
function formatBunBuildErrors(errors) {
	return errors
		.map((error) => {
			const pos = error.position;

			if (!pos?.file) return `  ${error.message}`;

			const location = `${pos.file}:${pos.line}:${pos.column}`;
			const snippet = pos.lineText ? `\n    > ${pos.lineText.trim()}` : "";

			return `  ${error.message}\n    at ${location}${snippet}`;
		})
		.join("\n");
}
