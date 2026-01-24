/**
 * Island SSR Renderer
 *
 * Renders island components to static HTML at build time.
 *
 * Progressive enhancement flow:
 * 1. Build time: Render component to HTML (this file)
 * 2. Browser loads: User sees static HTML instantly
 * 3. JS arrives: Component hydrates and becomes interactive
 *
 * SSR may fail if component uses browser-only APIs (window, document).
 * That's fine - we skip SSR and the island will still hydrate and work,
 * just without the initial static HTML.
 */

import { styleText } from "node:util";
import { getModule } from "../config.js";
import { PreactConfig } from "./preact-config.js";

/**
 * Render an island component to static HTML
 *
 * @param {{ compiledCode: string, props: Record<string, unknown>, elementName: string }} params
 * @returns {Promise<string | undefined>} Rendered HTML or undefined
 */
export async function renderIslandSSR({ compiledCode, props, elementName }) {
	if (!compiledCode) return;

	try {
		// Load the compiled module
		const module = await getModule(elementName, compiledCode, "ssr");
		const Component = module.default;

		if (!Component) {
			console.warn(
				styleText("yellow", `SSR: No default export in ${elementName}`),
			);
			return;
		}

		// Use Preact's renderSSR function
		const html = await PreactConfig.renderSSR(Component, props);

		return html;
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		// Expected failures:
		// - Components using browser-only APIs (window, document)
		// - Components with client-only dependencies
		console.warn(
			styleText("yellow", `SSR failed for ${elementName}:`),
			err.message,
		);
	}
}
