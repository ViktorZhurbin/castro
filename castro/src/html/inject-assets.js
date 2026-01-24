/**
 * Asset Injection
 *
 * Collects assets from plugins and injects them into HTML.
 * Assets include scripts, stylesheets, and import maps.
 *
 * Educational note: Import maps are a browser feature that lets
 * you use bare module specifiers like `import { h } from "preact"`
 * without a bundler. We generate one to load framework code from CDN.
 */

import { join } from "node:path";
import * as esbuild from "esbuild";
import { defaultPlugins } from "../islands/plugins.js";

/**
 * @import { Asset, ImportMap } from '../types.d.ts'
 */

/**  @type {string | null} */
let cachedLiveReloadJs = null;

/**
 * Get live reload script (bundled, cached)
 */
async function getLiveReloadAsset() {
	if (cachedLiveReloadJs) return cachedLiveReloadJs;

	const result = await esbuild.build({
		entryPoints: [join(import.meta.dirname, "../dev/live-reload.js")],
		write: false,
		bundle: true,
		format: "esm",
		target: "node22",
		logLevel: "warning",
	});

	cachedLiveReloadJs = result.outputFiles[0].text;

	return cachedLiveReloadJs;
}

/**
 * Collect all assets and import maps from plugins
 *
 * @returns {Promise<{ assets: Asset[]; mergedImportMap: ImportMap }>}
 */
export async function collectAssets() {
	/** @type {ImportMap} */
	const mergedImportMap = {};
	/** @type {Asset[]} */
	const assets = [];

	// Collect from plugins
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			const importMap = plugin.getImportMap();
			if (importMap) Object.assign(mergedImportMap, importMap);
		}

		if (plugin.getAssets) {
			const pluginAssets = plugin.getAssets();
			assets.push(...pluginAssets);
		}
	}

	// Auto-inject live reload in dev mode
	if (process.env.NODE_ENV === "development") {
		const content = await getLiveReloadAsset();

		assets.push({
			content,
			tag: "script",
			attrs: { type: "module" },
		});
	}

	return { assets, mergedImportMap };
}

/**
 * Inject assets and import maps into HTML
 *
 * @param {string} html - HTML to inject into
 * @param {{ assets?: Asset[], mergedImportMap?: ImportMap }} options
 * @returns {string} HTML with injected assets
 */
export function injectAssets(html, { assets = [], mergedImportMap = {} }) {
	let output = html;

	// Generate HTML strings
	const importMapHtml = generateImportMapHtml(mergedImportMap);
	const assetsHtml = generateAssetsHtml(assets);

	// Inject into HTML
	if (importMapHtml || assetsHtml) {
		const headCloseIndex = output.indexOf("</head>");
		const bodyCloseIndex = output.indexOf("</body>");

		const injectionHtml = [importMapHtml, assetsHtml].filter(Boolean).join("");

		if (headCloseIndex !== -1) {
			output =
				output.slice(0, headCloseIndex) +
				injectionHtml +
				output.slice(headCloseIndex);
		} else if (bodyCloseIndex !== -1) {
			output =
				output.slice(0, bodyCloseIndex) +
				injectionHtml +
				output.slice(bodyCloseIndex);
		}
	}

	// Ensure DOCTYPE
	if (!output.startsWith("<!DOCTYPE")) {
		output = `<!DOCTYPE html>\n${output}`;
	}

	return output;
}

/**
 * Generate import map script tag
 *
 * @param {ImportMap} importMap
 * @returns {string}
 */
function generateImportMapHtml(importMap) {
	if (!Object.keys(importMap).length) return "";

	return `
		<script type="importmap">
			${JSON.stringify({ imports: importMap }, null, 2)}
		</script>
	`.trim();
}

/**
 * Generate HTML for assets (scripts and links)
 *
 * @param {Asset[]} assets
 * @returns {string}
 */
function generateAssetsHtml(assets) {
	return assets
		.map((asset) => {
			if (typeof asset === "string") return asset;

			const attrs = attributesToString(asset.attrs);

			if (asset.tag === "link") {
				return `<link ${attrs}>`;
			}

			if (asset.tag === "script") {
				return `<script ${attrs}>${asset.content || ""}</script>`;
			}

			return "";
		})
		.join("\n");
}

/**
 * Convert object to HTML attribute string
 *
 * @param {Record<string, string | boolean>} [attrs]
 * @returns {string}
 */
function attributesToString(attrs = {}) {
	return Object.entries(attrs)
		.map(([key, value]) => {
			if (value === true) return key;
			if (value === false || value === null || value === undefined) return "";
			return `${key}="${value}"`;
		})
		.filter(Boolean)
		.join(" ");
}
