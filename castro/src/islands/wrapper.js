/**
 * Island Wrapper
 *
 * Transforms HTML to wrap custom elements with <castro-island>.
 * This is where the magic happens - we find components in the HTML
 * and wrap them with our lazy-loading infrastructure.
 *
 * Educational note: This runs at BUILD TIME, not runtime.
 * We scan the rendered HTML for custom elements like <preact-counter>
 * and wrap them in <castro-island> which handles lazy hydration.
 */

import { castValue, toCamelCase } from "./client-runtime.js";
import { renderIslandSSR } from "./ssr-renderer.js";

/**
 * @import { IslandComponent } from '../types.d.ts'
 */

/**
 * Wrap custom elements with <castro-island> for lazy loading
 *
 * @param {string} content - HTML content to transform
 * @param {IslandComponent[]} components - Known island components
 * @param {string} loadingStrategy - Hydration directive (e.g., "comrade:visible")
 * @returns {Promise<string>} Transformed HTML
 */
export async function wrapWithIsland(
	content,
	components,
	loadingStrategy = "comrade:visible",
) {
	if (!components.length) return content;

	// Build lookup map for quick component access
	const componentMap = new Map(
		components.map((c) => [c.elementName.toLowerCase(), c]),
	);

	// Build regex to find all component tags
	const tagNames = components.map((c) => c.elementName).join("|");
	const tagRegex = new RegExp(
		`<(${tagNames})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
		"gi",
	);

	const matches = Array.from(content.matchAll(tagRegex));
	if (matches.length === 0) return content;

	// Process all matches and prepare replacements
	const replacements = await Promise.all(
		matches.map(async (match) => {
			const [fullMatch, tagName, attrs, innerContent] = match;
			const component = componentMap.get(tagName.toLowerCase());

			if (!component) {
				return {
					index: match.index,
					length: fullMatch.length,
					markup: fullMatch,
				};
			}

			// Extract props from data-* attributes for SSR
			const props = extractProps(attrs);
			let staticHtml = innerContent;

			// Try to render component at build time (SSR)
			if (component.ssrCode) {
				const rendered = await renderIslandSSR({
					props,
					compiledCode: component.ssrCode,
					elementName: component.elementName,
				});
				if (rendered) staticHtml = rendered;
			}

			// Build the wrapper markup
			const markup = `
<div class="castro-island-container">
  <castro-island ${loadingStrategy} import="${component.outputPath}">
    <${component.elementName}${attrs}>${staticHtml}</${component.elementName}>
    ${component.cssPath ? `<link rel="stylesheet" href="${component.cssPath}">` : ""}
  </castro-island>
</div>`.trim();

			return { index: match.index, length: fullMatch.length, markup };
		}),
	);

	// Single-pass string reconstruction (performance optimization)
	let result = "";
	let lastIndex = 0;

	for (const { index, length, markup } of replacements) {
		result += content.slice(lastIndex, index) + markup;
		lastIndex = index + length;
	}

	result += content.slice(lastIndex);

	return result;
}

/**
 * Extract props from data-* attributes string
 *
 * @param {string} attrsString - Raw attributes string from HTML
 * @returns {Record<string, unknown>}
 */
function extractProps(attrsString) {
	/** @type {Record<string, unknown>} */
	const props = {};

	const dataAttrRegex = /data-([a-z0-9-]+)=["']([^"']*)["']/g;

	for (const [, key, value] of attrsString.matchAll(dataAttrRegex)) {
		const camelKey = toCamelCase(key);
		props[camelKey] = castValue(value);
	}

	return props;
}
