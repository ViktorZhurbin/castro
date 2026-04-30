/**
 * Island Compiler
 *
 * Compiles island components for both client and server:
 * - Client: Bundled JS that runs in the browser
 * - Server: Code that runs at build time for SSR
 *
 * We compile twice because the environments differ:
 * - Browser needs bundled code with import map externals
 * - Bun needs unbundled code that can import packages
 *
 * Neither compilation uses islandMarkerPlugin, which means islands cannot
 * nest other islands. If Island A imports Island B, B renders as a plain
 * component inside A — no <castro-island> wrapper, no independent hydration.
 * This is intentional and shared by most island frameworks (Fresh, Astro):
 * islands are leaf nodes in the component tree, not composable containers.
 */

import { basename, dirname, extname, resolve } from "node:path";
import { config as castroConfig } from "../config.js";
import { safeBunBuild } from "../utils/bunBuild.js";
import { getProjectDependencies } from "../utils/dependencies.js";
import { CastroError } from "../utils/errors.js";
import { getFrameworkConfig } from "./frameworkConfig.js";

/**
 * @import { IslandComponent } from "../types.js"
 */

/**
 * Compile an island component for both client and SSR
 *
 * Handles hashing and file writing. The compiler generates hashed filenames
 * for cache busting and returns the actual public paths to use in HTML.
 *
 * @param {{ sourcePath: string, outputDir: string, publicDir: string, frameworkId: string }} params
 * @returns {Promise<IslandComponent>}
 */
export async function compileIsland({
	sourcePath,
	outputDir,
	publicDir,
	frameworkId,
}) {
	// Compile SSR version first (runs at build time in Bun)
	const ssrCode = await compileIslandSSR({ sourcePath, frameworkId });

	// Compile client version (runs in browser)
	const clientResult = await compileIslandClient({
		sourcePath,
		outputDir,
		frameworkId,
	});

	// Find the actual generated files (with hashes)
	const jsFile = clientResult.outputs.find((f) => f.path.endsWith(".js"));
	const cssFile = clientResult.outputs.find((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new CastroError("BUNDLE_FAILED", undefined);
	}

	// Construct public paths using the generated filenames
	// Normalize to forward slashes for cross-platform URL compatibility
	const publicJsPath = `${publicDir}/${basename(jsFile.path)}`.replaceAll(
		"\\",
		"/",
	);

	// CSS kept as a string (not written to disk) — it's inlined per-page
	// in writeHtmlPage.js, since each page uses a different island subset.
	const cssContent = cssFile ? await cssFile.text() : "";

	return {
		ssrCode,
		sourcePath,
		publicJsPath,
		cssContent,
		frameworkId,
	};
}

/**
 * Compile island for client-side execution
 *
 * Creates a module that exports a mounting function.
 * The mounting function handles hydration when called.
 * Outputs files with content hashes for cache busting.
 *
 * @param {{ sourcePath: string, outputDir: string, frameworkId: string }} params
 */
async function compileIslandClient({ sourcePath, outputDir, frameworkId }) {
	const componentName = basename(sourcePath, extname(sourcePath));

	// Virtual entry point: a generated module that imports the real component
	// and wraps it in a mounting function for hydration. This file never exists
	// on disk — Bun's `files` option lets us feed code strings directly into the
	// bundler as if they were real files (same concept as Vite/Rollup virtual modules).
	const frameworkConfig = getFrameworkConfig(frameworkId);

	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${frameworkConfig.hydrateFnString}
		}
	`.trim();

	const buildConfig = frameworkConfig.getBuildConfig();

	// Calculate externals: framework defaults + user config dependencies + import map keys.
	// We strip trailing slashes from import map keys so Bun can treat them as package names.
	const userImportMapKeys = Object.keys(castroConfig.importMap ?? {}).map(
		(key) => key.replace(/\/$/, ""),
	);

	const external = [
		...new Set([
			...(buildConfig.external ?? []),
			...(frameworkConfig.clientDependencies ?? []),
			...(castroConfig.clientDependencies ?? []),
			...userImportMapKeys,
		]),
	];

	// Path must be absolute and in the same directory as the island source,
	// so the relative import ('./${basename}') resolves to the real file
	const virtualEntryPath = resolve(
		dirname(sourcePath),
		`${componentName}.virtual.js`,
	);

	const result = await safeBunBuild({
		entrypoints: [virtualEntryPath],
		files: { [virtualEntryPath]: virtualEntry },
		outdir: outputDir,
		naming: { entry: `${componentName}-[hash].[ext]` },
		format: "esm",
		target: "browser",
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		loader: { ".css": "css" },
		...buildConfig,
		external,
	});

	return result;
}

/**
 * Compile island for server-side rendering (Bun execution)
 *
 * SSR compilation differs from client:
 * - Target is Bun, not browser
 * - Regular CSS imports are stubbed (SSR doesn't need them)
 * - CSS module imports (.module.css) are kept so class name mappings work during SSR
 * - Result is kept in memory, not written to disk
 * - Used only to generate static HTML at build time
 *
 * @param {{ sourcePath: string, frameworkId: string }} params
 */
async function compileIslandSSR({ sourcePath, frameworkId }) {
	const frameworkConfig = getFrameworkConfig(frameworkId);
	const buildConfig = frameworkConfig.getBuildConfig("ssr");

	// Stub regular CSS imports — they're side-effectful (no exports needed)
	// and would fail in Bun's SSR environment. CSS module imports (.module.css)
	// are left alone so Bun compiles them normally, providing the class name
	// mapping that components need during SSR.
	/** @type {Bun.BunPlugin} */
	const cssStubPlugin = {
		name: "css-stub",
		setup(build) {
			build.onResolve({ filter: /(?<!\.module)\.css$/ }, () => ({
				path: "css-stub",
				namespace: "css-stub",
			}));

			build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
				contents: "export default {};",
				loader: "js",
			}));
		},
	};

	const result = await safeBunBuild({
		entrypoints: [sourcePath],
		format: "esm",
		target: "bun",
		// Externalizes all NPM package imports found in package.json.
		// This enables native support for tsconfig `paths` aliases (e.g., @components/*),
		// as Bun will resolve local paths that are NOT in the dependencies list.
		external: await getProjectDependencies(),
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		...buildConfig,
		// Merge framework plugins (e.g. Solid's Babel transform) with
		// the CSS stub. Placed after ...buildConfig so cssStubPlugin
		// always runs regardless of what the framework provides.
		plugins: [...(buildConfig.plugins ?? []), cssStubPlugin],
	});

	const output = result.outputs[0];

	return output ? await output.text() : "";
}
