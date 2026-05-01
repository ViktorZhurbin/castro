/**
 * Writes CSS files extracted by Bun.build() to disk and returns
 * Asset objects for injection into the HTML page.
 * Used by both page and layout compilation.
 */

import { basename, join, relative } from "node:path";
import { OUTPUT_DIR } from "../constants.js";

/**
 * @import { Asset } from '../types.d.ts'
 */

/**
 * @param {Bun.BuildArtifact[]} cssFiles - CSS output from Bun.build()
 * @param {string} outputDir - Directory to write CSS files to
 * @returns {Promise<Asset[]>} CSS link assets for HTML injection
 */
export async function writeCSSFiles(cssFiles, outputDir) {
	if (cssFiles.length === 0) return [];

	const cssAssets = [];

	for (const cssFile of cssFiles) {
		// Bun names CSS outputs like "page.tsx.css" — strip the source extension
		const originalName = basename(cssFile.path);
		const cssFileName = originalName.replace(/\.(jsx|tsx|js|ts)\.css$/, ".css");

		const cssOutputPath = join(outputDir, cssFileName);
		const cssText = await cssFile.text();
		await Bun.write(cssOutputPath, cssText);

		const cssPublicPath = `/${relative(OUTPUT_DIR, cssOutputPath)}`;

		cssAssets.push({
			tag: "link",
			attrs: { rel: "stylesheet", href: cssPublicPath },
		});
	}

	return cssAssets;
}
