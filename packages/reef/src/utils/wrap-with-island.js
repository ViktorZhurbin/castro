import { renderIslandSSR } from "../plugins/islands/utils/render-ssr.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Wraps custom elements with <reef-island> for lazy loading.
 * Also renders components to static HTML at build time.
 *
 * @param {string} content - HTML content
 * @param {IslandComponent[]} components - Island components to wrap
 * @param {string} loadingStrategy - Default loading strategy (e.g., "on:visible", "on:idle")
 * @returns {Promise<string>} Transformed HTML
 */
export async function wrapWithIsland(
	content,
	components,
	loadingStrategy = "on:visible",
) {
	if (!components.length) return content;

	// Create a map for $O(1)$ lookup during replacement
	const componentMap = new Map(
		components.map((c) => [c.elementName.toLowerCase(), c]),
	);

	// Create a single regex that matches ANY of our registered component tags
	const tagNames = components.map((c) => c.elementName).join("|");
	const tagRegex = new RegExp(
		`<(${tagNames})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
		"gi",
	);

	// Phase 1: Collect matches and prepare async SSR data
	const matches = Array.from(content.matchAll(tagRegex));
	if (matches.length === 0) return content;

	// Prepare replacement data asynchronously
	const replacements = await Promise.all(
		matches.map(async (match) => {
			const [fullMatch, tagName, attrs, innerContent] = match;
			const component = componentMap.get(tagName.toLowerCase());

			if (!component) {
				console.warn(
					`[reef] Found tag <${tagName}> but no component was registered for it.`,
				);
				return { fullMatch, markup: fullMatch };
			}

			const props = extractProps(attrs);

			let staticHtml = innerContent;
			if (component.ssrCode) {
				const rendered = await renderIslandSSR({
					props,
					compiledCode: component.ssrCode,
					framework: component.framework,
					elementName: component.elementName,
				});
				if (rendered) staticHtml = rendered;
			}

			const markup = `
				<div class="reef-island-container">
					<reef-island ${loadingStrategy} import="${component.outputPath}">
						<${component.elementName}${attrs}>${staticHtml}</${component.elementName}>
						${component.cssPath ? `<link rel="stylesheet" href="${component.cssPath}">` : ""}
					</reef-island>
				</div>`.trim();

			return { fullMatch, markup };
		}),
	);

	// Phase 2: Perform the replacement
	// We use a unique placeholder approach or index-based replacement
	// to avoid the bug where identical tags replace the wrong instance.
	let result = content;
	for (const { fullMatch, markup } of replacements) {
		// We only replace the FIRST occurrence each time because we iterate
		// in the same order as matchAll.
		result = result.replace(fullMatch, markup);
	}

	return result;
}

/**
 * Extract and cast props from HTML attributes string.
 * Supports: Numbers, Booleans, and JSON strings.
 */
function extractProps(attrsString) {
	/** @type Record<string, unknown> */
	const props = {};
	// Match data-prop="value" or data-prop='value'
	const attrRegex = /data-([a-z0-9-]+)=["']([^"']*)["']/g;

	for (const [, key, value] of attrsString.matchAll(attrRegex)) {
		// kebab-case to camelCase
		const camelKey = key.replace(/-([a-z0-9])/g, (_, char) =>
			char.toUpperCase(),
		);

		props[camelKey] = castValue(value);
	}

	return props;
}

/**
 * Casts a string attribute value to its proper JS type.
 */
function castValue(val) {
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "" || val === null) return true; // Boolean attribute shorthand: data-is-active

	// Attempt to parse as Number
	if (val !== "" && !Number.isNaN(val)) return Number(val);

	// Attempt to parse as JSON (for arrays/objects)
	if (val.startsWith("{") || val.startsWith("[")) {
		try {
			return JSON.parse(val);
		} catch {
			return val;
		}
	}

	return val;
}
