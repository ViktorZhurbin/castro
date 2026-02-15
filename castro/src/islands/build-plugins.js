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

import { dirname, resolve } from "node:path";
import { getIslandId } from "../utils/ids.js";

const CASTRO_SRC = resolve(dirname(import.meta.path), "..");

/**
 * Generates stub code that replaces the real island source during compilation.
 * The stub imports renderMarker() from marker.js and delegates to it.
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @returns {string} JavaScript source code
 */
function generateMarkerCode(islandId) {
	const MARKER_PATH = resolve(CASTRO_SRC, "islands/marker.js");

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
