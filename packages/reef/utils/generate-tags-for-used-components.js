import { filterUsedComponents } from "./filter-used-components.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 * @import { Asset } from '../types/plugin.js';
 */

/**
 * Generate asset objects for components used on a page
 * Filters components by page content and returns both script and stylesheet assets
 *
 * @param {IslandComponent[]} discoveredComponents - All available components
 * @param {string} pageContent - HTML or markdown content to scan for usage
 * @returns {Asset[]} Array of asset objects
 *
 * @example
 * generateAssetsForUsedComponents(
 *   [
 *     {elementName: 'counter-preact', outputPath: '/components/counter-preact.js', cssPath: '/components/counter-preact.css'},
 *     {elementName: 'button-preact', outputPath: '/components/button-preact.js'}
 *   ],
 *   '<counter-preact></counter-preact>'
 * )
 * // Returns: [
 * //   { tag: 'script', attrs: { type: 'module', src: '/components/counter-preact.js' } },
 * //   { tag: 'link', attrs: { rel: 'stylesheet', href: '/components/counter-preact.css' } }
 * // ]
 */
export function generateAssetsForUsedComponents(
	discoveredComponents,
	pageContent,
) {
	const usedComponents = filterUsedComponents(
		discoveredComponents,
		pageContent,
	);

	/** @type {Asset[]} */
	const assets = [];

	for (const component of usedComponents) {
		// Add script asset
		assets.push({
			tag: "script",
			attrs: { type: "module", src: component.outputPath },
		});

		// Add CSS link asset if component has CSS
		if (component.cssPath) {
			assets.push({
				tag: "link",
				attrs: { rel: "stylesheet", href: component.cssPath },
			});
		}
	}

	return assets;
}
