/**
 * Island Marker
 *
 * Called synchronously during renderToString() when the VNode tree hits
 * an island component. The buildPlugins replaced the real island import
 * with a stub that calls renderMarker(), which:
 *
 * 1. Looks up the island's pre-loaded SSR module in the registry
 * 2. Renders it to HTML (server-side)
 * 3. Wraps it in a <castro-island> custom element for client hydration
 *
 * Also tracks which islands each page uses, so only their CSS gets injected.
 *
 * Island tracking is scoped per-page using AsyncLocalStorage. Each page build
 * runs inside runWithPageState(), which provides a fresh context. This isolates
 * pageState.usedIslands and pageState.usedFrameworks so parallel builds would be
 * safe (though the build loop remains sequential for now).
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { h } from "preact";
import { CastroError } from "../utils/errors.js";
import { getFrameworkConfig } from "./frameworkConfig.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from "preact"
 * @import { Directive } from "../types.js"
 */

/**
 * AsyncLocalStorage for per-page island tracking.
 * @type {AsyncLocalStorage<{ usedIslands: Set<string>, usedFrameworks: Set<string> }>}
 */
const pageStateStore = new AsyncLocalStorage();

/**
 * Run a function with a fresh per-page tracking context.
 * Returns the populated state so callers can aggregate across pages.
 *
 * @param {() => Promise<void>} fn
 * @returns {Promise<{ usedIslands: Set<string>, usedFrameworks: Set<string> }>}
 */
export async function runWithPageState(fn) {
	const state = {
		/** @type {Set<string>} */
		usedIslands: new Set(),
		/** @type {Set<string>} */
		usedFrameworks: new Set(),
	};
	await pageStateStore.run(state, fn);
	return state;
}

/**
 * Get the current page's tracking state.
 * Must only be called inside runWithPageState().
 *
 * @returns {{ usedIslands: Set<string>, usedFrameworks: Set<string> }}
 */
export function getPageState() {
	const state = pageStateStore.getStore();
	if (!state) {
		throw new Error(
			"getPageState() called outside runWithPageState(). " +
				"Every page render must be wrapped — see buildAll.js.",
		);
	}
	return state;
}

/**
 * Render an island marker component
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @param {Record<string, any>} props - Component props including directives
 * @returns {VNode}
 */
export function renderMarker(islandId, props = {}) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new CastroError("ISLAND_NOT_FOUND", { islandId });
	}

	// Each island carries its framework id from compilation step.
	// Resolve the config synchronously from the pre-loaded cache.
	const frameworkConfig = getFrameworkConfig(island.frameworkId);

	const { directive, cleanProps } = processProps(props);

	const state = getPageState();
	state.usedIslands.add(islandId);
	state.usedFrameworks.add(island.frameworkId);

	let ssrHtml = "";

	try {
		ssrHtml = frameworkConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (err) {
		throw new CastroError("ISLAND_RENDER_FAILED", {
			islandId,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}

	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: ssrHtml },
	});
}

/** @type {Directive[]} */
const DIRECTIVES = ["comrade:eager", "comrade:patient", "comrade:visible"];
/** @type {Directive} */
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Extract and validate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
 */
function processProps(props = {}) {
	const foundDirectives = DIRECTIVES.filter((d) => d in props);

	const cleanProps = { ...props };

	if (foundDirectives.length > 0) {
		delete cleanProps[foundDirectives[0]];
	}

	return {
		cleanProps,
		directive: foundDirectives[0] ?? DEFAULT_DIRECTIVE,
	};
}
