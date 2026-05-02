/**
 * castro-jsx island hydration — runs in the browser.
 *
 * Inlined verbatim into the per-island bundle by compiler.js.
 * Must be self-contained: no Node-only imports, no captured closure variables.
 *
 * Clears SSR HTML before mounting because castro-jsx doesn't walk existing DOM
 * like Preact's hydrate() — it mounts fresh reactive DOM. The tradeoff: a brief
 * flash of replacement, imperceptible for small islands.
 */

/**
 * @param {Element} container
 * @param {Record<string, unknown>} props
 * @param {Function} Component
 */
export async function hydrate(container, props, Component) {
	container.innerHTML = "";
	const dom = Component(props);
	if (dom instanceof Node) container.appendChild(dom);
}
