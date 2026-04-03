/**
 * HTML Page Writer
 *
 * Final step in page building. Takes rendered HTML and:
 * 1. Gathers assets (page CSS, island CSS, plugin assets, live reload)
 * 2. Injects all assets into <head> (or <body> fallback)
 * 3. Writes the file to disk
 */

import { createRequire } from "node:module";
import { join } from "node:path";
import { config as castroConfig } from "../config.js";
import { getFrameworkConfig } from "../islands/frameworkConfig.js";
import { allPlugins } from "../islands/plugins.js";
import { islands } from "../islands/registry.js";
import { getSafePkgName } from "../utils/dependencies.js";

const require = createRequire(import.meta.url);

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
async function resolvePageContext({ usedIslands, pageCssAssets = [] }) {
	/** @type {ImportsMap} */
	const importMap = {};
	const assets = [...pageCssAssets];
	const hasIslands = usedIslands.size > 0;

	if (hasIslands) {
		const clientDeps = new Set(castroConfig.clientDependencies || []);
		const frameworks = new Set();

		for (const id of usedIslands) {
			const island = islands.getIsland(id);
			if (island) frameworks.add(island.frameworkId);
		}

		for (const name of frameworks) {
			const fwConfig = getFrameworkConfig(name);

			for (const dep of fwConfig.clientDependencies) {
				clientDeps.add(dep);
			}

			if (fwConfig.headAssets) {
				assets.push(...fwConfig.headAssets);
			}
		}

		// 2. Generate local vendor entries with version-based cache busting
		for (const dep of clientDeps) {
			const safeName = getSafePkgName(dep);

			try {
				// Resolve the actual installed package.json to get the version.
				// pkgRoot is the part before the first slash (e.g., "preact" from "preact/hooks").
				// Handles scoped packages like @preact/signals or @vktrz/castro-jsx.
				const pkgRoot = dep.startsWith("@")
					? dep.split("/").slice(0, 2).join("/")
					: dep.split("/")[0];
				const version = require(`${pkgRoot}/package.json`).version;

				importMap[dep] = `/vendor/${safeName}.js?v=${version}`;
			} catch {
				importMap[dep] = `/vendor/${safeName}.js`;
			}
		}

		// 3. User explicit import map entries override everything (advanced escape hatch)
		Object.assign(importMap, castroConfig.importMap);
	}

	// Plugin assets: island runtime script, CSS links, etc.
	for (const plugin of allPlugins) {
		if (plugin.getPageAssets) {
			assets.push(...plugin.getPageAssets({ hasIslands }));
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
	let output = html;

	const tags = [
		generateImportMap(importMap),
		...assets.map(generateAssetTag),
	].filter(Boolean);

	if (tags.length > 0) {
		// Inject before </head> so CSS is render-blocking (prevents flash of
		// unstyled content). Fall back to </body> for layouts without a <head>.
		const injection = tags.join("\n");
		const headEnd = output.indexOf("</head>");
		const bodyEnd = output.indexOf("</body>");
		const insertAt = headEnd !== -1 ? headEnd : bodyEnd;

		if (insertAt !== -1) {
			output = output.slice(0, insertAt) + injection + output.slice(insertAt);
		}
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
