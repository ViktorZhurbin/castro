/**
 * HTML Page Writer
 *
 * Final step in page building. Gathers the page's head tags — CSS links,
 * island import map + runtime, inline island styles, live reload in dev —
 * injects them into <head> (or <body> fallback), and writes the file to disk.
 */

import { join } from "node:path/posix";
import { ISLAND_RUNTIME_FILE } from "../constants.js";
import { islands } from "../islands/registry.js";
import { getIslandImportMap } from "./vendor.js";

/**
 * @typedef {{ cssTags?: string[]; usedIslands: Set<string> }} Options
 */

/**
 * @param {string} rawHtml
 * @param {string} outputFilePath
 * @param {Options} options
 */
export async function writeHtmlPage(rawHtml, outputFilePath, options) {
	const tags = await collectHeadTags(options);

	await Bun.write(outputFilePath, injectTags(rawHtml, tags));
}

/**
 * Gather every tag this page needs, in injection order.
 *
 * @param {Options} options
 * @returns {Promise<string[]>}
 */
async function collectHeadTags({ usedIslands, cssTags = [] }) {
	const tags = [...cssTags];

	// Island pages get an import map pointing at the vendored Preact
	// dependencies, plus the hydration runtime. Static pages get neither.
	if (usedIslands.size > 0) {
		const imports = JSON.stringify({ imports: getIslandImportMap() }, null, 2);

		tags.push(`<script type="importmap">${imports}</script>`);
		tags.push(`<script type="module" src="/${ISLAND_RUNTIME_FILE}"></script>`);
	}

	// Island CSS is inlined as <style> rather than written to disk because each
	// page renders a different subset of islands — per-page permutations aren't
	// worth caching as separate files. Only islands actually rendered get included.
	const cssManifest = islands.getCssManifest();
	for (const id of usedIslands) {
		const css = cssManifest.get(id);

		if (css) {
			tags.push(`<style>${css}</style>`);
		}
	}

	// Dev-only: live reload SSE client
	if (process.env.NODE_ENV !== "production") {
		tags.push(await getLiveReloadTag());
	}

	return tags;
}

/** @type {string | null} */
let _liveReloadTagCache = null;

async function getLiveReloadTag() {
	if (!_liveReloadTagCache) {
		const source = await Bun.file(
			join(import.meta.dir, "../dev/liveReload.js"),
		).text();

		_liveReloadTagCache = `<script type="module">${source}</script>`;
	}

	return _liveReloadTagCache;
}

/**
 * Inject tags before </head> so CSS is render-blocking (prevents flash of
 * unstyled content). Falls back to </body> for layouts without a <head>.
 *
 * @param {string} html
 * @param {string[]} tags
 * @returns {string}
 */
function injectTags(html, tags) {
	if (tags.length === 0) return ensureDoctype(html);

	const injection = tags.join("\n");

	// Matches </head> OR </body> (case-insensitive).
	const anchor = /<\/head>|<\/body>/i;

	// `layout: false` pages render only their content VNode — no <head> or
	// <body> shell to anchor to. String.replace with no match is a silent
	// no-op, so without this branch the tags (CSS, import map, island
	// runtime, hydration styles) would just vanish. Prepend instead.
	const output = anchor.test(html)
		? html.replace(anchor, (match) => `${injection}\n${match}`)
		: `${injection}\n${html}`;

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
