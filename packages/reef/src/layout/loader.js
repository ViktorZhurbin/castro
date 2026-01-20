import { rmSync } from "node:fs";
import { access, glob } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { LAYOUTS_DIR } from "../constants/dir.js";
import { compileJSX } from "../utils/compile-jsx.js";
import { resolveTempDir } from "../utils/tempDir.js";

/**
 * @import { LayoutComponent } from '../types/layout.js';
 */

/**
 * Discover, compile, and load all JSX layouts
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map();

	// Check if layouts directory exists
	try {
		await access(LAYOUTS_DIR);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			throw new Error(
				`Layouts directory not found: ${LAYOUTS_DIR}\nCreate it and add at least default.jsx`,
			);
		}
		throw err;
	}

	// Ensure a clean temp dir
	const tempDirPath = resolveTempDir(LAYOUTS_DIR);
	rmSync(tempDirPath, { recursive: true, force: true });

	// Process layouts concurrently using Array.fromAsync + glob
	await Array.fromAsync(
		glob(join(LAYOUTS_DIR, "**/*.{jsx,tsx}")),
		async (sourceFilePath) => {
			const fileName = basename(sourceFilePath);
			const layoutName = basename(fileName, extname(fileName));

			try {
				// Compile and load layout module
				const layoutModule = await compileJSX(sourceFilePath);

				if (!layoutModule.default) {
					throw new Error(
						`Layout ${fileName} must have a default export function`,
					);
				}

				layouts.set(layoutName, layoutModule.default);
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				throw new Error(`Failed to load layout ${fileName}: ${err.message}`);
			}
		},
	);

	// Validate results
	if (layouts.size === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	console.info(
		styleText("green", "✓ Loaded layouts:"),
		Array.from(layouts.keys()).join(", "),
	);

	// Ensure default layout exists
	if (!layouts.has("default")) {
		throw new Error("Required layout 'default.jsx' not found in layouts/");
	}

	return layouts;
}
