import { styleText } from "node:util";
import { getModule } from "../../../utils/tempDir.js";
import { FrameworkConfig } from "../framework-config.js";

/**
 * @import { SupportedFramework } from '../../../types/island.js';
 */

/**
 * Renders island component to static HTML string at build time
 *
 * @param {{
 * 	compiledCode: string;
 * 	props: Record<string, unknown>; // Component props (camelCase)
 * 	framework: SupportedFramework;
 * 	elementName: string; // Element name for debugging
 * }} params
 *
 * @returns {Promise<string | undefined>} Rendered HTML or undefined
 */
export async function renderIslandSSR({
	compiledCode,
	props,
	framework,
	elementName,
}) {
	if (!compiledCode) return;

	try {
		const module = await getModule(elementName, compiledCode, "ssr");
		const Component = module.default;

		if (!Component) {
			console.warn(
				styleText("yellow", `SSR: No default export in ${elementName}`),
			);
			return;
		}

		const config = FrameworkConfig[framework];
		const html = await config.renderSSR(Component, props);

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
