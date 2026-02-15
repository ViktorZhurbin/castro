/**
 * HTML Page Writer
 *
 * Final step in page building. Takes rendered HTML and:
 * 1. Gathers assets (page CSS, island CSS, plugin assets, live reload)
 * 2. Runs plugin transform hooks on the HTML
 * 3. Injects all assets into <head> (or <body> fallback)
 * 4. Writes the file to disk
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
 * @param {string} rawHtml
 * @param {string} outputPath
 * @param {Options} options
 */
export async function writeHtmlPage(rawHtml, outputPath, options) {
	const context = await resolvePageContext(options);
	const { html, assets: transformAssets } = await runTransforms(rawHtml);

	const finalHtml = injectAssets(html, {
		importMap: context.importMap,
		assets: [...context.assets, ...transformAssets],
	});

	await Bun.write(outputPath, finalHtml);
}

// ============================================================================
// Resolution — gather all assets needed for this page
// ============================================================================

/**
 * @param {Options} options
 */
async function resolvePageContext({ usedIslands, pageCssAssets = [] }) {
	/** @type {ImportsMap} */
	const importMap = {};
	const assets = [...pageCssAssets];

	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			Object.assign(importMap, plugin.getImportMap());
		}

		if (plugin.getPageAssets) {
			const hasIslands = usedIslands.size > 0;

			assets.push(...plugin.getPageAssets({ hasIslands }));
		}
	}

	// Inject CSS only for islands actually used on this page
	const cssManifest = islands.getCssManifest();
	if (usedIslands.size && cssManifest.size) {
		for (const id of usedIslands) {
			const css = cssManifest.get(id);
			if (css) assets.push({ tag: "style", content: css });
		}
	}

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
// Transformation — let plugins modify HTML
// ============================================================================

/**
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

	// Try </head> first, fall back to </body>
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
	if (typeof asset === "string") {
		return asset;
	}

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
