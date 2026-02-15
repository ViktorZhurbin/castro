import { resolve } from "node:path";
import {
	castroExternalsPlugin,
	islandMarkerPlugin,
} from "../islands/build-plugins.js";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for injection.
 * Uses island build plugins to replace island imports with marker components.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 */
export async function compileJSX(sourcePath) {
	// Build configuration
	// Bun.build requires absolute entrypoints when using onResolve plugins
	const absoluteSourcePath = resolve(sourcePath);

	const result = await Bun.build({
		entrypoints: [absoluteSourcePath],
		target: "bun",
		packages: "external",
		format: "esm",
		// Pages and layouts compile to Preact VNodes (not HTML strings directly).
		// The final renderToString() call in render-page.js converts the complete
		// VNode tree to HTML in one pass. This is a build-time convenience —
		// Preact is NOT shipped to the browser for static pages.
		jsx: { runtime: "automatic", importSource: "preact" },
		loader: {
			".css": "css",
		},
		define: {
			// makes sure we use production mode for SSG
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		plugins: [castroExternalsPlugin, islandMarkerPlugin],
	});

	if (!result.success) {
		const errors = result.logs.map((log) => log.message).join("\n");
		throw new Error(`Bundle failed for ${sourcePath}:\n${errors}`);
	}

	const jsFile = result.outputs.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputs.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new Error(messages.build.noJsOutput(sourcePath));
	}

	const jsText = await jsFile.text();

	return {
		module: await getModule(sourcePath, jsText),
		cssFiles,
	};
}
