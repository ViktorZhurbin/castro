/**
 * Island SSR Renderer
 *
 * Renders island components to static HTML at build time.
 *
 * Educational note: This is what enables "progressive enhancement":
 * 1. At build time, we render the component to HTML
 * 2. Users see content immediately (no JS needed)
 * 3. When JS loads, it "hydrates" to become interactive
 *
 * If SSR fails (browser-only APIs, etc.), we just skip it.
 * The island will still work, just without initial HTML.
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
