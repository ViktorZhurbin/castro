import path from "node:path";

/**
 * Extract metadata from JSX file's `export const meta` statement
 * @param {string} jsxFilePath - Absolute path to JSX file
 * @returns {Promise<object>} Metadata object (empty if no meta export)
 *
 * @example
 * // page.jsx contains: export const meta = { layout: 'blog', title: 'Post' }
 * const meta = await extractJSXMeta('/path/to/page.jsx');
 * // → { layout: 'blog', title: 'Post' }
 */
export async function extractJSXMeta(jsxFilePath) {
	try {
		// Use query param to bust module cache in dev mode
		const timestamp = Date.now();
		const absolutePath = path.resolve(jsxFilePath);
		const pageModule = await import(`${absolutePath}?t=${timestamp}`);

		// Return meta if it exists, otherwise empty object
		return pageModule.meta || {};
	} catch (err) {
		// If file doesn't exist or fails to import, return empty meta
		console.warn(`Failed to extract meta from ${jsxFilePath}:`, err.message);
		return {};
	}
}
