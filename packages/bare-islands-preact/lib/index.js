import fsPromises from "node:fs/promises";
import path from "node:path";
import {
	detectCustomElements,
	generateScriptTag,
	getElementName,
} from "@vktrz/bare-static/plugin-utils";
import { compileJSXIsland } from "./jsx-compiler.js";

const DEFAULT_ISLANDS_DIR = "islands-preact";
const OUTPUT_DIR = "dist";

/**
 * Bare Islands Preact Plugin
 * Enables interactive islands architecture with Preact JSX components
 *
 * @param {Object} options - Plugin configuration
 * @param {string} [options.islandsDir] - Directory containing JSX islands
 * @returns {Object} Plugin instance with hooks
 */
export function bareIslandsPreact(options = {}) {
	const { islandsDir = DEFAULT_ISLANDS_DIR } = options;

	let discoveredComponents = [];

	return {
		name: "bare-islands-preact",

		// Watch islands directory for changes in dev mode
		watchDirs: [islandsDir],

		/**
		 * Hook: Called during build to discover, compile, and copy components
		 * @param {Object} context - Build context
		 * @param {string} context.outputDir - The output directory path
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			discoveredComponents = [];

			// Process JSX islands
			await processIslands(islandsDir, outputDir, discoveredComponents);
		},

		/**
		 * Hook: Returns import map for Preact runtime from CDN
		 * @returns {Promise<string|null>} Import map script tag or null
		 */
		async getImportMap() {
			if (discoveredComponents.length === 0) return null;

			const importMap = {
				imports: {
					preact: "https://cdn.jsdelivr.net/npm/preact@10.28.2/+esm",
					"preact/hooks":
						"https://cdn.jsdelivr.net/npm/preact@10.28.2/hooks/+esm",
					"preact/jsx-runtime":
						"https://cdn.jsdelivr.net/npm/preact@10.28.2/jsx-runtime/+esm",
					"preact-custom-element":
						"https://cdn.jsdelivr.net/npm/preact-custom-element@4.6.0/dist/preact-custom-element.esm.js",
				},
			};

			return `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>`;
		},

		/**
		 * Hook: Returns script tags to inject into pages
		 * Only injects scripts for components actually used on the page
		 * @param {Object} context - Script context
		 * @param {string} context.pageContent - The markdown content of the page
		 * @returns {Promise<string[]>} Array of script tag strings
		 */
		async getScripts({ pageContent }) {
			// Detect which custom elements are used on this page
			const usedElements = detectCustomElements(pageContent);

			// Filter components to only those used on this page
			const usedComponents = discoveredComponents.filter(({ elementName }) =>
				usedElements.has(elementName),
			);

			// Return script tags only for used components
			return usedComponents.map(({ outputPath }) =>
				generateScriptTag(outputPath),
			);
		},
	};
}

/**
 * Process JSX island files - compile with esbuild and wrap in web components
 * @param {string} islandsDir - Islands directory
 * @param {string} outputDir - Output directory
 * @param {Array} discoveredComponents - Array to track discovered components
 */
async function processIslands(islandsDir, outputDir, discoveredComponents) {
	try {
		const files = await fsPromises.readdir(islandsDir);
		const jsxFiles = files.filter(
			(f) => f.endsWith(".jsx") || f.endsWith(".tsx"),
		);

		if (jsxFiles.length === 0) return;

		const outputComponentsDir = path.join(outputDir, "components");
		await fsPromises.mkdir(outputComponentsDir, { recursive: true });

		for (const fileName of jsxFiles) {
			const elementName = getElementName(fileName, "-preact");
			const outputFileName = `${elementName}.js`;

			try {
				const sourcePath = path.join(islandsDir, fileName);

				await compileJSXIsland({
					sourcePath,
					outputPath: path.join(outputComponentsDir, outputFileName),
					elementName,
				});

				discoveredComponents.push({
					type: "island",
					sourceDir: islandsDir,
					sourceFile: fileName,
					elementName,
					outputPath: `/components/${outputFileName}`,
				});
			} catch (err) {
				throw new Error(`Failed to process island ${fileName}: ${err.message}`);
			}
		}
	} catch (err) {
		if (err.code === "ENOENT") return;
		throw err;
	}
}
