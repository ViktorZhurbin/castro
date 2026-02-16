/**
 * HTML Page Writer
 *
 * Final step in page building. Takes rendered HTML and:
 * 1. Gathers assets (page CSS, island CSS, plugin assets, live reload)
 * 2. Injects all assets into <head> (or <body> fallback)
 * 3. Writes the file to disk
 */

import { join } from "node:path";
import { defaultPlugins } from "../islands/plugins.js";
import { islands } from "../islands/registry.js";

/**
 * @import { Asset, ImportsMap } from '../types.js'
 *
 * @typedef {{ pageCssAssets?: Asset[]; usedIslands: Set<string>; needsHydration: boolean; }} Options
 */

/**
 * @param {string} rawHtml
 * @param {string} outputPath
 * @param {Options} options
 */
export async function writeHtmlPage(rawHtml, outputPath, options) {
	const context = await resolvePageContext(options);

	const finalHtml = injectAssets(rawHtml, {
		importMap: context.importMap,
		assets: context.assets,
	});

	await Bun.write(outputPath, finalHtml);
}

// ============================================================================
// Resolution — gather all assets needed for this page
// ============================================================================

/**
 * @param {Options} options
 */
async function resolvePageContext({
	usedIslands,
	needsHydration,
	pageCssAssets = [],
}) {
	/** @type {ImportsMap} */
	const importMap = {};
	const assets = [...pageCssAssets];

	// Plugin assets: island runtime script, import maps for CDN modules.
	// Only included when at least one island needs client-side hydration
	// (no:pasaran-only pages skip the runtime entirely).
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			Object.assign(importMap, plugin.getImportMap());
		}

		if (plugin.getPageAssets) {
			assets.push(...plugin.getPageAssets({ needsHydration }));
		}
	}

	// Island CSS: only for islands actually rendered on this page
	const cssManifest = islands.getCssManifest();
	if (usedIslands.size && cssManifest.size) {
		for (const id of usedIslands) {
			const css = cssManifest.get(id);
			if (css) assets.push({ tag: "style", content: css });
		}
	}

	// Dev-only: live reload SSE client
	if (process.env.NODE_ENV !== "production") {
		assets.push(await getLiveReloadAsset());
	}

	return { assets, importMap };
}

/** @type {string | null} */
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
// Injection — insert assets into the HTML string
// ============================================================================

/**
 * @param {string} html
 * @param {{ assets: Asset[]; importMap: ImportsMap }} options
 */
function injectAssets(html, { assets, importMap }) {
	let output = html;

	const tags = [
		generateImportMap(importMap),
		...assets.map(generateAssetTag),
	].filter(Boolean);

	if (tags.length === 0) return output;

	// Inject before </head> so CSS is render-blocking (prevents flash of
	// unstyled content). Fall back to </body> for layouts without a <head>.
	const injection = tags.join("\n");
	const headEnd = output.indexOf("</head>");
	const bodyEnd = output.indexOf("</body>");
	const insertAt = headEnd !== -1 ? headEnd : bodyEnd;

	if (insertAt !== -1) {
		output = output.slice(0, insertAt) + injection + output.slice(insertAt);
	}

	if (!output.trimStart().toLowerCase().startsWith("<!doctype")) {
		output = `<!DOCTYPE html>\n${output}`;
	}

	return output;
}

// ============================================================================
// HTML tag generation helpers
// ============================================================================

/**
 * @param {ImportsMap} map
 * @returns {string}
 */
function generateImportMap(map) {
	if (!map || Object.keys(map).length === 0) return "";
	return `<script type="importmap">${JSON.stringify({ imports: map }, null, 2)}</script>`;
}

/**
 * @param {Asset} asset
 * @returns {string}
 */
function generateAssetTag(asset) {
	switch (asset.tag) {
		case "link": {
			const attrs = attrsToString(asset.attrs);
			return `<link ${attrs}>`;
		}

		case "style":
			return `<style>${asset.content}</style>`;

		case "script": {
			const attrs = attrsToString(asset.attrs);
			return `<script ${attrs}>${asset.content || ""}</script>`;
		}

		default:
			return "";
	}
}

/**
 * @param {Record<string, any>} attrs
 * @returns {string}
 */
function attrsToString(attrs = {}) {
	return Object.entries(attrs)
		.filter(([_, v]) => v !== false && v !== null && v !== undefined)
		.map(([k, v]) => (v === true ? k : `${k}="${v}"`))
		.join(" ");
}
