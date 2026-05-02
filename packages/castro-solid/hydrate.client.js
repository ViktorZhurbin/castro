/**
 * Solid.js island hydration — runs in the browser.
 *
 * Inlined verbatim into the per-island bundle by compiler.js.
 * Must be self-contained: no Node-only imports, no captured closure variables.
 */

/**
 * @param {Element} container
 * @param {Record<string, unknown>} props
 * @param {Function} Component
 */
export async function hydrate(container, props, Component) {
	const { hydrate } = await import("solid-js/web");
	hydrate(() => Component(props), container);
}
