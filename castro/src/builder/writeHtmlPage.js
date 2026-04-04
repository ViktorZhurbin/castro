/**
 * HTML Page Writer
 *
 * Final step in page building. Takes rendered HTML and:
 * 1. Gathers assets (page CSS, island CSS, plugin assets, live reload)
 * 2. Injects all assets into <head> (or <body> fallback)
 * 3. Writes the file to disk
 */

import { join } from "node:path";
import { config as castroConfig } from "../config.js";
import { getFrameworkConfig } from "../islands/frameworkConfig.js";
import { allPlugins } from "../islands/plugins.js";
import { islands } from "../islands/registry.js";

/**
 * @import { Asset, ImportsMap } from '../types.js'
 *
 * @typedef {{ pageCssAssets?: Asset[]; usedIslands: Set<string>; usedFrameworks: Set<string>; }} Options
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
	usedFrameworks,
	pageCssAssets = [],
}) {
	const hasIslands = usedIslands.size > 0;
	const assets = [...pageCssAssets];

	for (const id of usedFrameworks) {
		const config = getFrameworkConfig(id);

		if (config.headAssets) {
			assets.push(...config.headAssets);
		}
	}

	/** @type {ImportsMap} */
	const importMap = {};

	for (const plugin of allPlugins) {
		// Plugin assets: island runtime script, CSS links, etc.
		if (plugin.getPageAssets) {
			assets.push(...plugin.getPageAssets({ hasIslands }));
		}

		// Import maps are only needed on pages with islands — no point building them
		// for static pages. Plugins add entries based on usedFrameworks.
		if (hasIslands && plugin.getImportMap) {
			const pluginImportMap = plugin.getImportMap({ usedFrameworks });

			Object.assign(importMap, pluginImportMap);
		}
	}

	if (hasIslands) {
		// User importMap entries override plugin-generated ones.
		Object.assign(importMap, castroConfig.importMap);
	}

	// Island CSS: only for islands actually rendered on this page
	const cssManifest = islands.getCssManifest();
	if (usedIslands.size && cssManifest.size) {
		for (const id of usedIslands) {
			const css = cssManifest.get(id);

			if (css) {
				assets.push({ tag: "style", content: css });
			}
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
			join(import.meta.dir, "../dev/liveReload.js"),
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
	const tags = [
		generateImportMap(importMap),
		...assets.map(generateAssetTag),
	].filter(Boolean);

	if (tags.length === 0) return ensureDoctype(html);

	// Inject before </head> so CSS is render-blocking (prevents flash of
	// unstyled content). Fall back to </body> for layouts without a <head>.
	const injection = tags.join("\n");

	const output = html.replace(
		// Matches </head> OR </body> (case-insensitive).
		/<\/head>|<\/body>/i,
		// Inserts injection before the matched tag.
		(match) => `${injection}\n${match}`,
	);

	return ensureDoctype(output);
}

/**
 * @param {string} html
 * @returns {string}
 */
function ensureDoctype(html) {
	return html.trimStart().toLowerCase().startsWith("<!doctype")
		? html
		: `<!DOCTYPE html>\n${html}`;
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
	if (typeof asset === "string") return asset;

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
