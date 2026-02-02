/**
 * Page Builder Shell
 *
 * Shared wrapper for page builders that handles common concerns:
 * - Path resolution
 * - Timing/logging
 * - Error handling
 */

import { join } from "node:path";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { formatMs } from "../utils/format.js";

/**
 * Shared wrapper for page builders
 *
 * @param {string} sourceFileName - Relative path of source file
 * @param {RegExp | string} extensionPattern - Pattern to replace with .html
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} options
 * @param {(ctx: { sourceFilePath: string, outputFilePath: string, outputFileName: string }) => Promise<void>} builderFn - The actual build logic
 */
export async function buildPageShell(
	sourceFileName,
	extensionPattern,
	options,
	builderFn,
) {
	const { logOnSuccess, logOnStart } = options;
	const startTime = performance.now();

	const outputFileName = sourceFileName.replace(extensionPattern, ".html");
	const outputFilePath = join(OUTPUT_DIR, outputFileName);
	const sourceFilePath = join(PAGES_DIR, sourceFileName);

	try {
		if (logOnStart) {
			console.info(
				messages.build.writingFile(
					styleText("cyan", sourceFileName),
					styleText("gray", outputFileName),
				),
			);
		}

		await builderFn({
			sourceFilePath,
			outputFilePath,
			outputFileName,
		});

		if (logOnSuccess) {
			const buildTime = formatMs(performance.now() - startTime);
			console.info(
				styleText(
					"green",
					messages.build.fileSuccess(outputFileName, buildTime),
				),
			);
		}
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.error(
			styleText("red", messages.build.fileFailure(sourceFileName, err.message)),
		);
		throw err;
	}
}
