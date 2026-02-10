/**
 * Framework Adapter
 *
 * Provides framework-specific behavior for island compilation, SSR, and hydration.
 * Uses an init() pattern: dependencies are loaded once (async), then all methods
 * are synchronous. This matters because island SSR runs inside the page's
 * synchronous renderToString call.
 *
 * To add a new framework:
 * 1. Add a case in initAdapter() with the framework's SSR and createElement functions
 * 2. Add the framework to the FRAMEWORK type in constants.js
 * 3. Install the framework as a peer dependency
 */

import { FRAMEWORK } from "../constants.js";
import { messages } from "../messages/index.js";

/**
 * @import { Adapter } from "../types.d.ts"
 */

/** @type {Adapter | null} */
let currentAdapter = null;

/**
 * Initialize the framework adapter.
 * Must be called once before any compilation or rendering.
 * Loads framework dependencies via dynamic import so only
 * the configured framework's packages need to be installed.
 */
export async function initAdapter() {
	if (currentAdapter) return;

	if (FRAMEWORK === "preact") {
		const { h } = await import("preact");
		const { renderToString } = await import("preact-render-to-string");

		currentAdapter = {
			name: "preact",

			getBuildConfig: () => ({
				jsx: { runtime: "automatic", importSource: "preact" },
				external: ["preact", "preact/hooks", "preact/jsx-runtime"],
			}),

			renderToString,

			renderComponentToString: (Component, props) =>
				renderToString(h(Component, props)),

			createElement: h,

			/**
			 * Returns the prop for injecting raw HTML into an element.
			 * Preact uses dangerouslySetInnerHTML (same as React).
			 * Other frameworks differ: Solid uses innerHTML, etc.
			 * @param {string} html
			 */
			rawHtmlProp: (html) => ({ dangerouslySetInnerHTML: { __html: html } }),

			hydrateFnString: `
				const { h, hydrate } = await import("preact");
				hydrate(h(Component, props), container);
			`,

			importMap: {
				preact: "https://esm.sh/preact",
				"preact/hooks": "https://esm.sh/preact/hooks",
				"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
			},
		};
	} else {
		throw new Error(messages.errors.unsupportedFramework(FRAMEWORK));
	}
}

/**
 * Get the initialized adapter.
 * Throws if called before initAdapter().
 * @returns {Adapter}
 */
export function getAdapter() {
	if (!currentAdapter) {
		throw new Error(
			"Framework adapter not initialized. Call initAdapter() first.",
		);
	}
	return currentAdapter;
}
