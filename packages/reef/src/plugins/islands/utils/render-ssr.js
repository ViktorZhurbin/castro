import { styleText } from "node:util";
import { getModule } from "../../../utils/tempDir.js";

/**
 * @import { SupportedFramework } from '../../../types/island.js';
 */

/**
 * Renders island component to static HTML string at build time
 *
 * @param {Object} params
 * @param {string} params.compiledCode - Compiled SSR code (ESM)
 * @param {Object} params.props - Component props (camelCase)
 * @param {SupportedFramework} params.framework
 * @param {string} params.elementName - Element name for debugging
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

		if (framework === "preact") {
			const { h } = await import("preact");
			const { render } = await import("preact-render-to-string");

			return render(h(Component, props));
		}

		if (framework === "solid") {
			const { renderToString, generateHydrationScript } = await import(
				"solid-js/web"
			);

			const hydrationScript = generateHydrationScript();
			const html = renderToString(() => Component(props));

			return hydrationScript + html;
		}

		console.warn(styleText("yellow", `SSR: Unknown framework ${framework}`));
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
