/**
 * Writes CSS files extracted by Bun.build() to disk and returns
 * stylesheet <link> tags for injection into the HTML page.
 * Used by both page and layout compilation.
 */

import { basename, join, relative } from "node:path/posix";
import { OUTPUT_DIR } from "../constants.js";

/**
 * @param {Bun.BuildArtifact[]} cssFiles - CSS output from Bun.build()
 * @param {string} outputDir - Directory to write CSS files to
 * @returns {Promise<string[]>} Stylesheet <link> tags for HTML injection
 */
export async function writeCSSFiles(cssFiles, outputDir) {
	const cssTags = [];

	for (const cssFile of cssFiles) {
		// Bun names CSS outputs like "page.tsx.css" — strip the source extension
		const originalName = basename(cssFile.path);
		const cssFileName = originalName.replace(/\.(jsx|tsx)\.css$/, ".css");

		const cssOutputPath = join(outputDir, cssFileName);
		await Bun.write(cssOutputPath, await cssFile.text());

		const cssPublicPath = `/${relative(OUTPUT_DIR, cssOutputPath)}`;
		cssTags.push(`<link rel="stylesheet" href="${cssPublicPath}">`);
	}

	return cssTags;
}
