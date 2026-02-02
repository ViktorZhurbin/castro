import { access, glob, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { styleText } from "node:util";
import { ISLANDS_DIR, OUTPUT_DIR } from "../constants.js";
import { compileIsland } from "../islands/compiler.js";
import { messages } from "../messages/index.js";
import { getIslandId } from "../utils/ids.js";

/**
 * @import { IslandsMap } from "../types.js"
 *
 * @typedef {{ islands: IslandsMap; cssManifest: Map<string, string> }} Result
 */

/**
 * @returns Promise<Result>
 */
export async function loadIslands() {
	/** @type {Result} */
	const result = {
		islands: new Map(),
		cssManifest: new Map(),
	};

	try {
		// Check if islands directory exists
		await access(ISLANDS_DIR);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);
		if (err.code === "ENOENT") {
			console.warn(
				styleText("red", `Islands directory not found:`),
				styleText("magenta", ISLANDS_DIR),
			);

			return result;
		}

		throw err;
	}

	// Prepare output directory
	const outputIslandsDir = join(OUTPUT_DIR, ISLANDS_DIR);
	await mkdir(outputIslandsDir, { recursive: true });

	// Process each island file
	/** @type {{ sourcePath: string }[]} */
	const compiledIslands = [];

	await Array.fromAsync(
		glob(join(ISLANDS_DIR, "**/*.{jsx,tsx}")),
		async (sourcePath) => {
			// Calculate output directory structure preserving nesting
			// path.join automatically normalizes "." segments, so we don't need
			// explicit checks for top-level files (e.g., join('islands', '.') → 'islands')
			const relativeDir = dirname(relative(ISLANDS_DIR, sourcePath));

			// Output directory: dist/islands/ui (automatically handles dot segments)
			const outputDir = join(outputIslandsDir, relativeDir);

			// Public URL base: /islands/ui
			// We join with path.join for robust handling, then normalize to forward slashes
			const publicDir = `/${join(ISLANDS_DIR, relativeDir)}`.replaceAll(
				"\\",
				"/",
			);

			try {
				// Compiler handles hashing and returns specific hashed filenames
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
				});

				const id = getIslandId(sourcePath);

				result.islands.set(id, component);

				// Store CSS content in manifest for later injection
				// Map ID -> CSS string for later lookup during rendering
				if (component.cssContent) {
					result.cssManifest.set(id, component.cssContent);
				}

				compiledIslands.push({ sourcePath });
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);
				throw new Error(err.message);
			}
		},
	);

	// Log compiled islands
	if (compiledIslands.length > 0) {
		console.info(
			styleText("green", messages.files.compiled(compiledIslands.length)),
		);
		for (const { sourcePath } of compiledIslands) {
			const relativePath = relative(process.cwd(), sourcePath);
			console.info(`  · ${styleText("cyan", relativePath)}`);
		}
	}

	return result;
}
