import { resolve } from "node:path";
import {
	castroExternalsPlugin,
	islandMarkerPlugin,
} from "../islands/buildPlugins.js";
import { safeBunBuild } from "../utils/build.js";
import { getModule } from "../utils/cache.js";
import { getProjectDependencies } from "../utils/dependencies.js";
import { CastroError } from "../utils/errors.js";

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

	const result = await safeBunBuild({
		entrypoints: [absoluteSourcePath],
		target: "bun",
		// Externalizes all NPM package imports found in package.json.
		// This enables native support for tsconfig `paths` aliases (e.g., @components/*),
		// as Bun will resolve local paths that are NOT in the dependencies list.
		external: await getProjectDependencies(),
		format: "esm",
		// Pages and layouts compile to Preact VNodes (not HTML strings directly).
		// The final renderToString() call in renderPage.js converts the complete
		// VNode tree to HTML in one pass. This is a build-time convenience —
		// Preact is NOT shipped to the browser for static pages.
		jsx: { runtime: "automatic", importSource: "preact" },
		loader: { ".css": "css" },
		define: {
			// makes sure we use production mode for SSG
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		plugins: [castroExternalsPlugin, islandMarkerPlugin],
	});

	const jsFile = result.outputs.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputs.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new CastroError("BUNDLE_FAILED", { source: sourcePath });
	}

	const jsText = await jsFile.text();

	return {
		cssFiles,
		module: await getModule(sourcePath, jsText),
	};
}
