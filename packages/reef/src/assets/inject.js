import { generateAssetsHtml, generateImportMapHtml } from "../layout/helpers.js";

/**
 * @import { Asset, ImportMapConfig } from '../types/plugin.js';
 */

/**
 * Inject assets and import maps into HTML
 * @param {string} html - HTML to inject into
 * @param {Object} options
 * @param {Asset[]} options.assets - Assets to inject
 * @param {ImportMapConfig[]} options.importMapConfigs - Import map configs to inject
 * @returns {string} HTML with injected assets
 */
export function injectAssets(html, { assets = [], importMapConfigs = [] }) {
	let output = html;

	// Render helpers to HTML strings
	const importMapHtml = generateImportMapHtml({ importMapConfigs });
	const assetsHtml = generateAssetsHtml({ assets });

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
