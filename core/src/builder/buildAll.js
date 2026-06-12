/**
 * Build Orchestrator
 *
 * Coordinates the full site build:
 * 1. Wipe and recreate output dir
 * 2. Copy public dir to output dir
 * 3. Compile and load islands and layouts
 * 4. Scan pages, detect route conflicts, build each page
 * 5. If any page rendered an island: copy the hydration runtime and vendor
 *    the frameworks' client dependencies
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path/posix";
import { styleText } from "node:util";
import {
	ISLAND_RUNTIME_FILE,
	OUTPUT_DIR,
	PAGES_DIR,
	PUBLIC_DIR,
} from "../constants.js";
import { runWithPageState } from "../islands/marker.js";
import { islands } from "../islands/registry.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { CastroError } from "../utils/errors.js";
import { buildPage } from "./buildPage.js";
import { vendorClientDeps } from "./vendor.js";

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

	await islands.load();
	await layouts.load();
	const pagesMap = await scanPages();

	const tasks = [...pagesMap.entries()].map(
		([outputPath, sourcePath]) =>
			async () => {
				const { usedIslands } = await runWithPageState(() =>
					buildPage(sourcePath),
				);

				// Log on completion so lines appear in the order pages actually finish
				if (isProd) {
					console.info(
						messages.build.writingFile(
							styleText("cyan", sourcePath),
							styleText("gray", outputPath),
						),
					);
				}

				return { hasIslands: usedIslands.size > 0 };
			},
	);

	// Real SSGs cap concurrency to bound Bun.build's memory pressure; see NON-GOALS.md
	const results = await Promise.all(tasks.map((task) => task()));

	// Island output is conditional: a site that rendered no islands ships
	// neither the hydration runtime nor any vendored Preact code.
	if (results.some((result) => result.hasIslands)) {
		await copyIslandRuntime();
		await vendorClientDeps();
	}

	console.info(messages.build.success(`${pagesMap.size}`));
}

/**
 * Copy the <castro-island> custom-element runtime to dist/. The same source
 * (islands/hydration.js) is inlined per-island for the components; this is the
 * one shared script tag the page loads to upgrade the markers.
 */
async function copyIslandRuntime() {
	await Bun.write(
		join(OUTPUT_DIR, ISLAND_RUNTIME_FILE),
		Bun.file(join(import.meta.dir, "../islands/hydration.js")),
	);
}

/**
 * Glob all pages, skip private paths, detect route conflicts.
 * @returns {Promise<Map<string, string>>} outputPath → sourcePath
 */
async function scanPages() {
	/** @type {Map<string, string>} */
	const pagesMap = new Map();
	const pageGlob = new Bun.Glob("**/*.{md,jsx,tsx}");

	// Missing pages/ throws here naturally — see NON-GOALS.md.
	// Empty pages/ falls through to NO_PAGES below.
	for await (const sourcePath of pageGlob.scan(PAGES_DIR)) {
		// Skip files/folders prefixed with `_` (private convention, e.g. _drafts/, _partial.tsx)
		if (sourcePath.split("/").some((segment) => segment.startsWith("_"))) {
			continue;
		}

		const outputPath = sourcePath.replace(/\.(md|[jt]sx)$/, ".html");

		// Example: both foo.md and foo.jsx try to be foo.html
		if (pagesMap.has(outputPath)) {
			const existingFile = pagesMap.get(outputPath);
			const route1 = `${PAGES_DIR}/${existingFile}`;
			const route2 = `${PAGES_DIR}/${sourcePath}`;

			throw new CastroError("ROUTE_CONFLICT", { route1, route2, outputPath });
		}

		pagesMap.set(outputPath, sourcePath);
	}

	// pages/ present but empty — distinct from missing, which throws above
	if (pagesMap.size === 0) {
		throw new CastroError("NO_PAGES", { dir: PAGES_DIR });
	}

	return pagesMap;
}
