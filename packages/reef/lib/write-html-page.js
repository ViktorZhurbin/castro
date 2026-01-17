import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { collectAssets } from "./collect-assets.js";
import { injectAssets } from "./inject-assets.js";

/**
 * @import { ReefPlugin } from '../types/plugin.js';
 */

/**
 * Collect assets, inject them into HTML, and write to file.
 *
 * @param {string} html - HTML content to process
 * @param {string} outputPath - Absolute path to output file
 */
export async function writeHtmlPage(html, outputPath) {
	// Collect assets and import maps (includes auto-injected live reload in dev)
	const { assets, importMapConfigs } = await collectAssets({
		pageContent: html,
	});

	// Inject assets and ensure DOCTYPE
	const finalHtml = injectAssets(html, { assets, importMapConfigs });

	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, finalHtml);
}
