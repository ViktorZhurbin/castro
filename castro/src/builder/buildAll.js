/**
 * Build Orchestrator
 *
 * Coordinates the full site build:
 * 1. Wipe and recreate output dir
 * 2. Copy public dir to output dir
 * 3. Run plugin pre-build hooks (onPageBuild)
 * 4. Compile and load islands and layouts
 * 5. Scan pages, detect route conflicts, build each page
 * 6. Run plugin post-build hooks (onAfterBuild) with build context
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR, PUBLIC_DIR } from "../constants.js";
import { pageState } from "../islands/marker.js";
import { allPlugins } from "../islands/plugins.js";
import { islands } from "../islands/registry.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { CastroError } from "../utils/errors.js";
import { buildPage } from "./buildPage.js";

/**
 * @import { BuildContext } from "../types.d.ts"
 */

export async function buildAll() {
	const isProd = process.env.NODE_ENV === "production";

	console.info(messages.build.starting);

	// Fresh build: wipe and recreate output dir.
	await rm(OUTPUT_DIR, { recursive: true, force: true });
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Copy static assets from public → output dir
	try {
		await cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		// ENOENT means PUBLIC_DIR doesn't exist, which is fine
		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	for (const plugin of allPlugins) {
		if (plugin.onPageBuild) {
			await plugin.onPageBuild();
		}
	}

	await islands.load();
	await layouts.load();

	// Scan all pages upfront to detect route conflicts before building.
	/** @type {Map<string, string>} */
	const outputMap = new Map();

	const pageGlob = new Bun.Glob("**/*.{md,jsx,tsx}");

	try {
		for await (const sourcePath of pageGlob.scan(PAGES_DIR)) {
			// Skip files/folders prefixed with `_` (private convention, e.g. _drafts/, _partial.tsx)
			if (sourcePath.split("/").some((segment) => segment.startsWith("_"))) {
				continue;
			}

			const outputPath = sourcePath.replace(/\.(md|[jt]sx)$/, ".html");

			// Example: both foo.md and foo.jsx try to be foo.html
			if (outputMap.has(outputPath)) {
				const existingFile = outputMap.get(outputPath);
				const route1 = `${PAGES_DIR}/${existingFile}`;
				const route2 = `${PAGES_DIR}/${sourcePath}`;

				throw new CastroError("ROUTE_CONFLICT", { route1, route2 });
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

	if (outputMap.size === 0) {
		console.warn(messages.build.noFiles);
		return;
	}

	// Accumulate build context across pages for onAfterBuild hooks
	/** @type {BuildContext} */
	const buildContext = { usedFrameworks: new Set() };

	for (const [outputPath, sourcePath] of outputMap.entries()) {
		if (isProd) {
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
				styleText(
					"red",
					messages.build.fileFailure(sourceFilePath),
				),
			);
			throw err;
		}

		// Merge per-page state into cross-page build context
		buildContext.usedFrameworks = buildContext.usedFrameworks.union(
			pageState.usedFrameworks,
		);
	}

	// Post-build hooks: plugins can conditionally write assets based
	// on which frameworks were actually used across all pages
	for (const plugin of allPlugins) {
		if (plugin.onAfterBuild) {
			await plugin.onAfterBuild(buildContext);
		}
	}

	console.info(messages.build.success(`${outputMap.size}`));
}
