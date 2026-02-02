/**
 * Page Builder Shell
 *
 * Shared wrapper for page builders that handles common concerns:
 * - Path resolution
 * - Timing/logging
 * - Error handling
 */

import { extname, join } from "node:path";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { buildJSXPage } from "./page-jsx.js";
import { buildMarkdownPage } from "./page-markdown.js";

/**
 * Shared wrapper for page builders
 *
 * @param {string} relativeSourcePath - Relative path of source file
 */
export async function buildPage(relativeSourcePath) {
	const sourceExt = extname(relativeSourcePath);
	const relativeOutputPath = relativeSourcePath.replace(sourceExt, ".html");

	const outputFilePath = join(OUTPUT_DIR, relativeOutputPath);
	const sourceFilePath = join(PAGES_DIR, relativeSourcePath);

	try {
		if (sourceExt === ".md") {
			await buildMarkdownPage(sourceFilePath, outputFilePath);
		} else {
			await buildJSXPage(sourceFilePath, outputFilePath);
		}
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.error(
			styleText("red", messages.build.fileFailure(sourceFilePath, err.message)),
		);
		throw err;
	}
}
