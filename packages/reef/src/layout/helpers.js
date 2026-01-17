/**
 * @import { Asset, ImportMapConfig } from '../types/plugin.js';
 */

/**
 * Merge multiple import map objects into one HTML string
 * @param {Object} options
 * @param {ImportMapConfig[]} options.importMapConfigs - Import map configs to inject
 * @returns {string} The <script type="importmap">... string
 */
export function generateImportMapHtml({ importMapConfigs }) {
	if (!importMapConfigs?.length) return "";

	// Merge the "imports" keys from all maps
	const mergedImports = importMapConfigs.reduce((acc, config) => {
		return Object.assign(acc, config.imports);
	}, {});

	return `
<script type="importmap">
${JSON.stringify({ imports: mergedImports }, null, 2)}
</script>`.trim();
}

/**
 * Render assets (scripts/links) to HTML string
 * @param {Object} options
 * @param {Asset[]} options.assets - Assets to inject
 * @returns {string} The combined HTML string of assets
 */
export function generateAssetsHtml({ assets = [] }) {
	return assets
		.map((asset) => {
			const attrs = attributesToString(asset.attrs);

			// Handle <link> tags (Void element, no closing tag)
			if (asset.tag === "link") {
				return `<link ${attrs}>`;
			}

			// Handle <script> tags
			if (asset.tag === "script") {
				return `<script ${attrs}>${asset.content || ""}</script>`;
			}

			return "";
		})
		.join("\n");
}

/**
 * Helper: Convert an object to an HTML attribute string
 * e.g. { type: "module", defer: true } -> 'type="module" defer'
 */
function attributesToString(attrs = {}) {
	return Object.entries(attrs)
		.map(([key, value]) => {
			if (value === true) return key; // Boolean attribute
			if (value === false || value === null || value === undefined) return "";
			return `${key}="${value}"`;
		})
		.filter(Boolean) // Remove empty strings
		.join(" ");
}
