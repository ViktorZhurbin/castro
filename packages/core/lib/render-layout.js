import render from "preact-render-to-string";

/**
 * Render a layout component to HTML string
 * @param {Function} layoutFn - Layout component function
 * @param {Object} props - Props to pass to layout (title, content, scripts, importMaps, etc.)
 * @returns {string} Rendered HTML
 */
export function renderLayout(layoutFn, props) {
	const vnode = layoutFn(props);
	const html = render(vnode);

	// Ensure proper DOCTYPE
	if (!html.startsWith("<!DOCTYPE")) {
		return `<!DOCTYPE html>\n${html}`;
	}
	return html;
}
