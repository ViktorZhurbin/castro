/**
 * Build Orchestrator
 *
 * Coordinates the full site build:
 * 1. Clean and prepare output directory
 * 2. Copy public/ assets
 * 3. Run plugin build hooks (island compilation, runtime copying)
 * 4. Load layouts
 * 5. Scan pages, detect route conflicts, build each page
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
 * @param {{ verbose?: boolean }} [options]
 */
export async function buildAll(options = {}) {
	const { verbose = false } = options;
	const startTime = performance.now();

	console.info(messages.build.starting);

	await rm(OUTPUT_DIR, { recursive: true, force: true });
	await mkdir(OUTPUT_DIR, { recursive: true });

	try {
		await cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	for (const plugin of defaultPlugins) {
		if (plugin.onPageBuild) {
			await plugin.onPageBuild();
		}
	}

	await layouts.load();

	// Scan all pages and detect route conflicts before building.
	// Two source files (e.g., foo.md and foo.jsx) targeting the same
	// output path would silently overwrite each other.

	/** @type {Map<string, string>} */
	const outputMap = new Map();

	const pageGlob = new Bun.Glob("**/*.{md,jsx,tsx}");

	try {
		for await (const sourcePath of pageGlob.scan(PAGES_DIR)) {
			const outputPath = sourcePath.replace(/\.(md|[jt]sx)$/, ".html");

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

		try {
			await buildPage(sourcePath);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);
			const sourceFilePath = `${PAGES_DIR}/${sourcePath}`;

			console.error(
				styleText("red", messages.build.fileFailure(sourceFilePath, err.message)),
			);
			throw err;
		}
	}

	if (outputMap.size === 0) {
		console.warn(messages.build.noFiles);
		return;
	}

	const buildTime = formatMs(performance.now() - startTime);
	console.info(messages.build.success(`${outputMap.size}`, buildTime));
}
