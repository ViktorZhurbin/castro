/**
 * Island Build Plugins
 *
 * Bun.build plugins that handle island detection at compile time.
 * When compileJSX() processes a page, these plugins intercept .island.tsx
 * imports and replace them with marker stubs that call renderMarker().
 *
 * Instead of shipping the real island component into the page bundle, we
 * swap it for a stub that renders SSR HTML wrapped in <castro-island>.
 *
 * Two plugins work together:
 * 1. islandMarkerPlugin — replaces island source with marker stub code
 * 2. castroExternalsPlugin — keeps Castro internals external so singletons
 *    (registry, island tracking) are shared across all compiled pages
 */

import { dirname, resolve } from "node:path/posix";
import { getIslandId } from "./islandId.js";

const CASTRO_SRC = resolve(dirname(import.meta.path), "..");
const MARKER_PATH = resolve(CASTRO_SRC, "islands/marker.js");

/**
 * Generates stub code that replaces the real island source during compilation.
 * The stub imports renderMarker() from marker.js and delegates to it.
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @returns {string} JavaScript source code
 */
function generateMarkerCode(islandId) {
	return `
    import { renderMarker } from "${MARKER_PATH}";
    export default (props) => renderMarker(${JSON.stringify(islandId)}, props);
  `.trim();
}

/**
 * Replaces .island.tsx imports with marker stub code.
 *
 * When Bun.build encounters `import Counter from "./Counter.island.tsx"`,
 * this plugin intercepts the load and returns generated code that calls
 * renderMarker() instead of the real component.
 *
 * @type {Bun.BunPlugin}
 */
export const islandMarkerPlugin = {
	name: "island-marker",
	setup(build) {
		build.onLoad({ filter: /\.island\.[jt]sx$/ }, (args) => {
			const islandId = getIslandId(args.path);
			const code = generateMarkerCode(islandId);

			return { contents: code, loader: "js" };
		});
	},
};

/**
 * Prevents Castro internals from being bundled into each page.
 *
 * Without this, Bun.build would give each page its own copy of the registry
 * and marker module, breaking singleton state (island tracking, CSS injection).
 * Marking them as external ensures compiled pages import the same in-memory
 * modules as the build process itself.
 *
 * @type {Bun.BunPlugin}
 */
export const castroExternalsPlugin = {
	name: "castro-externals",

	setup(build) {
		build.onResolve({ filter: /.*/ }, (args) => {
			if (args.path.startsWith(CASTRO_SRC)) {
				return { path: args.path, external: true };
			}
		});
	},
};

/**
 * Lets pages import CSS straight from an npm package, e.g.
 * `import "@vktrz/bare-css/style.css"`.
 *
 * compileJSX marks every package.json dependency external (see
 * getProjectDependencies) so JS deps resolve to their installed singletons and
 * tsconfig `paths` aliases pass through. That's right for JS but wrong for CSS:
 * a stylesheet has no runtime singleton — it must be bundled to be extracted
 * into the page's <link>. Resolving a bare `.css` specifier to its absolute
 * path (honouring the package's `exports`) sidesteps the external match, so Bun
 * bundles it exactly like a local co-located stylesheet.
 *
 * @type {Bun.BunPlugin}
 */
export const cssPackagePlugin = {
	name: "css-package",

	setup(build) {
		build.onResolve({ filter: /\.css$/ }, async (args) => {
			// Relative/absolute imports already resolve normally; only bare
			// package specifiers get caught by the external list.
			if (args.path.startsWith(".") || args.path.startsWith("/")) return;

			return { path: await Bun.resolve(args.path, dirname(args.importer)) };
		});
	},
};
