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
 * pageState.usedIslands and pageState.usedFrameworks across concurrent page builds.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { h } from "preact";
import { CastroError } from "../utils/errors.js";
import { getFrameworkConfig } from "./frameworkConfig.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from "preact"
 * @import { Directive, IslandComponent } from "../types.d.ts"
 *
 * @typedef {IslandComponent & { ssrModule: NonNullable<IslandComponent["ssrModule"]> }} LoadedIsland
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
 * Throws a plain Error (not CastroError): this only fires if the build
 * pipeline forgot to wrap a render in runWithPageState() — a Castro-internal
 * bug that should surface as a stack trace, not a user-facing error card.
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
 * Render an island marker component.
 *
 * Three steps, each in its own function below: look the island up, render its
 * SSR HTML, wrap the result in a <castro-island> VNode for client hydration.
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @param {Record<string, any>} props - Component props including directives
 * @returns {VNode}
 */
export function renderMarker(islandId, props = {}) {
	const island = lookupIsland(islandId);
	const { directive, cleanProps } = processProps(props);

	const state = getPageState();
	state.usedIslands.add(islandId);
	state.usedFrameworks.add(island.frameworkId);

	const ssrHtml = renderIslandSSR(island, islandId, cleanProps);

	/**
	 * Build the <castro-island> VNode that the hydration runtime upgrades in the
	 * browser. The SSR HTML is injected as the element's children so the page is
	 * interactive-looking before any JS runs.
	 */
	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: ssrHtml },
	});
}

/**
 * Look up a compiled island and assert its SSR module is loaded.
 *
 * @param {string} islandId
 * @returns {LoadedIsland}
 */
function lookupIsland(islandId) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new CastroError("ISLAND_NOT_FOUND", { islandId });
	}

	return /** @type {LoadedIsland} */ (island);
}

/**
 * Render the island's pre-loaded SSR module to HTML using its framework's
 * renderer. Wraps any framework-side throw in a CastroError so the build
 * surfaces a structured error instead of a raw stack.
 *
 * @param {LoadedIsland} island
 * @param {string} islandId
 * @param {Record<string, any>} cleanProps
 * @returns {string}
 */
function renderIslandSSR(island, islandId, cleanProps) {
	const frameworkConfig = getFrameworkConfig(island.frameworkId);

	try {
		return frameworkConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (err) {
		throw new CastroError("ISLAND_RENDER_FAILED", {
			islandId,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}

/** @type {Directive[]} */
const DIRECTIVES = ["comrade:eager", "comrade:patient", "comrade:visible"];
/** @type {Directive} */
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Separate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
 */
function processProps(props = {}) {
	const specifiedDirective = DIRECTIVES.find((d) => d in props);

	const cleanProps = { ...props };
	for (const directive of DIRECTIVES) {
		delete cleanProps[directive];
	}

	return { cleanProps, directive: specifiedDirective ?? DEFAULT_DIRECTIVE };
}
