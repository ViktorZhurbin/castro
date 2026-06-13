/**
 * Per-Page Build State
 *
 * Each page build runs inside runWithPageState(), which provides a fresh
 * { usedIslands } context via AsyncLocalStorage. Because the context is scoped
 * to the async call tree, concurrent page builds never see each other's state —
 * this is what makes the parallel Promise.all in buildAll.js safe without globals.
 *
 * renderMarker() (marker.js) records islands into this context during the
 * synchronous renderToString() pass; the builder reads it back afterward to
 * gate per-page CSS and the island runtime.
 */

import { AsyncLocalStorage } from "node:async_hooks";

/**
 * @typedef {{ usedIslands: Set<string> }} PageState
 */

/** @type {AsyncLocalStorage<PageState>} */
const pageStateStore = new AsyncLocalStorage();

/**
 * Run a function with a fresh per-page tracking context.
 * Returns the populated state so callers can aggregate across pages.
 *
 * @param {() => Promise<void>} fn
 * @returns {Promise<PageState>}
 */
export async function runWithPageState(fn) {
	/** @type {PageState} */
	const state = { usedIslands: new Set() };
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
 * @returns {PageState}
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
