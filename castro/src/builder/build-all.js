/**
 * Builder - Main Build Orchestrator
 *
 * This is the entry point for building your site.
 * It coordinates all the steps:
 * 1. Load layouts
 * 2. Clean and prepare output directory
 * 3. Copy public assets
 * 4. Run plugin build hooks
 * 5. Build all pages (markdown and JSX)
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR, PUBLIC_DIR } from "../constants.js";
import { defaultPlugins } from "../islands/plugins.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { formatMs } from "../utils/format.js";
import { buildPage } from "./build-page.js";

/**
 * Build all pages to HTML
 *
 * @param {{ verbose?: boolean }} [options]
 */
export async function buildAll(options = {}) {
	const { verbose = false } = options;
	const startTime = performance.now();

	console.info(messages.build.starting);

	// Clean up output directory and recreate it
	await rm(OUTPUT_DIR, { recursive: true, force: true });
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Copy public directory to output if it exists
	try {
		await cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		// Silently skip if public directory doesn't exist
		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	// Run plugin onBuild hooks (for file copying, etc.)
	for (const plugin of defaultPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild();
		}
	}

	// Initialize layouts registry
	await layouts.load();

	// Collect all pages and detect route conflicts
	//
	// We scan all .md, .jsx, and .tsx files in pages/ and check if any
	// would produce the same .html output path (e.g., foo.md and foo.jsx
	// both want to become foo.html). This prevents silent overwrites.

	/** @type {Map<string, string>} */
	const outputMap = new Map(); // htmlPath → sourceFile

	const pageGlob = new Bun.Glob("**/*.{md,jsx,tsx}");

	try {
		for await (const sourcePath of pageGlob.scan(PAGES_DIR)) {
			const outputPath = sourcePath.replace(/\.(md|[jt]sx)$/, ".html");

			// Detect route conflicts (two files producing same output)
			if (outputMap.has(outputPath)) {
				const existingFile = outputMap.get(outputPath);
				const errorMessage = messages.errors.routeConflict(
					`${PAGES_DIR}/${existingFile}`,
					`${PAGES_DIR}/${sourcePath}`,
				);

				throw new Error(errorMessage);
			}

			outputMap.set(outputPath, sourcePath);
		}
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		if (err.code === "ENOENT") {
			return;
		}
		throw err;
	}

	for (const [outputPath, sourcePath] of outputMap.entries()) {
		if (verbose) {
			console.info(
				messages.build.writingFile(
					styleText("cyan", sourcePath),
					styleText("gray", outputPath),
				),
			);
		}

		await buildPage(sourcePath);
	}

	if (outputMap.size === 0) {
		console.warn(messages.build.noFiles);
		return;
	}

	const buildTime = formatMs(performance.now() - startTime);
	console.info(messages.build.success(`${outputMap.size}`, buildTime));
}
