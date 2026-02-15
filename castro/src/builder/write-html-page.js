/**
 * HTML Page Writer
 *
 * Final step in page building. It orchestrates the pipeline:
 * 1. Resolution: Gather all assets (Static, Page-level, Island CSS, Imports)
 * 2. Transformation: Run plugin hooks on the HTML
 * 3. Injection: Insert all gathered assets into the HTML
 * 4. Output: Write to disk
 */

import { join } from "node:path";
import { defaultPlugins } from "../islands/plugins.js";
import { islands } from "../islands/registry.js";

/**
 * @import { Asset, ImportsMap } from '../types.js'
 *
 * @typedef {{ pageCssAssets?: Asset[]; usedIslands: Set<string>; }} Options
 */

/**
 * Process HTML and write to file
 *
 * @param {string} rawHtml
 * @param {string} outputPath
 * @param {Options} options
 */
export async function writeHtmlPage(rawHtml, outputPath, options) {
	// 1. Resolution Phase: Gather all assets from all sources
	const context = await resolvePageContext(options);

	// 2. Transform Phase: Allow plugins to modify HTML
	const { html, assets: transformAssets } = await runTransforms(rawHtml);

	// 3. Injection Phase: Combine all assets and inject into HTML
	const finalHtml = injectAssets(html, {
		importMap: context.importMap,
		assets: [...context.assets, ...transformAssets],
	});

	// 4. Output Phase (Bun.write auto-creates parent directories)
	await Bun.write(outputPath, finalHtml);
}

// ============================================================================
// Phase 1: Resolution (Gathering Data)
// ============================================================================

/**
 * Resolves all initial assets required for the page.
 * This aggregates Page CSS, Island CSS, Plugin Assets, and Live Reload script.
 * @param {Options} options
 */
async function resolvePageContext({ usedIslands, pageCssAssets = [] }) {
	/** @type {ImportsMap} */
	const importMap = {};
	const assets = [...pageCssAssets];

	// A. Resolve Plugin Assets & Import Maps
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) Object.assign(importMap, plugin.getImportMap());
		if (plugin.getAssets) assets.push(...plugin.getAssets());
	}

	// B. Resolve Island CSS (Registry Lookup)
	const cssManifest = islands.getCssManifest();
	if (usedIslands.size && cssManifest.size) {
		for (const id of usedIslands) {
			const css = cssManifest.get(id);
			if (css) assets.push({ tag: "style", content: css });
		}
	}

	// C. Resolve Live Reload (Dev Mode only)
	if (process.env.NODE_ENV !== "production") {
		assets.push(await getLiveReloadAsset());
	}

	return { assets, importMap };
}

/**
 * Cache for the live reload script content
 * @type {string | null}
 */
let _liveReloadCache = null;

async function getLiveReloadAsset() {
	if (!_liveReloadCache) {
		_liveReloadCache = await Bun.file(
			join(import.meta.dir, "../dev/live-reload.js"),
		).text();
	}
	return {
		tag: "script",
		attrs: { type: "module" },
		content: _liveReloadCache,
	};
}

// ============================================================================
// Phase 2: Transformation (Modifying HTML)
// ============================================================================

/**
 *
 * @param {string} html
 * @returns {Promise<{ html: string; assets: Asset[] }>}
 */
async function runTransforms(html) {
	let currentHtml = html;
	const assets = [];

	for (const plugin of defaultPlugins) {
		if (plugin.transform) {
			const result = await plugin.transform({ content: currentHtml });
			currentHtml = result.html;
			if (result.assets) assets.push(...result.assets);
		}
	}

	return { html: currentHtml, assets };
}

// ============================================================================
// Phase 3: Injection (String Manipulation)
// ============================================================================

/**
 * Pure function to inject assets into HTML string.
 * No side effects, no registry lookups.
 *
 * @param {string} html
 * @param {{ assets: Asset[]; importMap: ImportsMap }} options
 */
function injectAssets(html, { assets, importMap }) {
	let output = html;

	// Generate tags
	const tags = [
		HTML.generateImportMap(importMap),
		...assets.map(HTML.generateAssetTag),
	].filter(Boolean);

	if (tags.length === 0) return output;

	// Injection strategy: Try </head>, fallback to </body>
	const headEndIndex = output.indexOf("</head>");
	const bodyEndIndex = output.indexOf("</body>");
	const injection = tags.join("\n");

	if (headEndIndex !== -1) {
		output =
			output.slice(0, headEndIndex) + injection + output.slice(headEndIndex);
	} else if (bodyEndIndex !== -1) {
		output =
			output.slice(0, bodyEndIndex) + injection + output.slice(bodyEndIndex);
	}

	// Ensure DOCTYPE exists
	if (!output.trimStart().toLowerCase().startsWith("<!doctype")) {
		output = `<!DOCTYPE html>\n${output}`;
	}

	return output;
}

// ============================================================================
// Utils: HTML Generation helpers
// ============================================================================

const HTML = {
	/**
	 * @param {ImportsMap} map
	 * @returns {string}
	 */
	generateImportMap(map) {
		if (!map || Object.keys(map).length === 0) return "";
		return `<script type="importmap">${JSON.stringify({ imports: map }, null, 2)}</script>`;
	},

	/**
	 * @param {Asset} asset
	 * @returns {string}
	 */
	generateAssetTag(asset) {
		if (typeof asset === "string") return asset;

		// Handle inline content (style/script) vs external references
		const attrs = HTML.attrsToString(asset.attrs);

		if (asset.tag === "link") return `<link ${attrs}>`;
		if (asset.tag === "style") return `<style>${asset.content}</style>`;
		if (asset.tag === "script") {
			return `<script ${attrs}>${asset.content || ""}</script>`;
		}
		return "";
	},

	/**
	 * @param {Record<string, any>} attrs
	 * @returns {string}
	 */
	attrsToString(attrs = {}) {
		return Object.entries(attrs)
			.filter(([_, v]) => v !== false && v !== null && v !== undefined)
			.map(([k, v]) => (v === true ? k : `${k}="${v}"`))
			.join(" ");
	},
};
