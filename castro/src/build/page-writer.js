/**
 * HTML Page Writer
 *
 * Final step in page building:
 * 1. Run transform hooks (e.g., wrapping islands)
 * 2. Collect assets from plugins
 * 3. Inject assets into HTML
 * 4. Write to disk
 *
 * Educational note: This is where all the plugin transforms
 * happen. The HTML goes through a pipeline before being saved.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { defaultPlugins } from "../islands/plugins.js";
import { collectAssets, injectAssets } from "../html/inject-assets.js";

/**
 * Process HTML and write to file
 *
 * @param {string} html - HTML content to process
 * @param {string} outputPath - Absolute path to output file
 */
export async function writeHtmlPage(html, outputPath) {
	// 1. Run transform hooks (island wrapping, etc.)
	let processedHtml = html;
	for (const plugin of defaultPlugins) {
		if (plugin.transform) {
			processedHtml = await plugin.transform({
				content: processedHtml,
			});
		}
	}

	// 2. Collect assets from plugins
	const { assets, mergedImportMap } = await collectAssets();

	// 3. Inject assets and ensure DOCTYPE
	const finalHtml = injectAssets(processedHtml, { assets, mergedImportMap });

	// 4. Write to disk
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, finalHtml);
}
