/**
 * Island Wrapper
 *
 * Transforms HTML to wrap custom elements with <castro-island>.
 *
 * Process:
 * 1. Find all custom element tags in HTML (e.g., <preact-counter>)
 * 2. Try to render them to static HTML at build time (SSR)
 * 3. Wrap them in <castro-island> with import path and loading strategy
 * 4. Browser will lazy-load and hydrate when conditions are met
 *
 * This runs at BUILD TIME. The output is static HTML with deferred
 * JavaScript loading infrastructure.
 */

import { getPropsFromAttributeString } from "./client-runtime.js";
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
			const props = getPropsFromAttributeString(attrs);
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

	// Single-pass string reconstruction
	// We build the new string by: keeping everything before a match,
	// inserting the replacement markup, repeat for each match,
	// then append everything after the last match.
	let result = "";
	let lastIndex = 0;

	for (const { index, length, markup } of replacements) {
		result += content.slice(lastIndex, index) + markup;
		lastIndex = index + length;
	}

	result += content.slice(lastIndex);

	return result;
}
