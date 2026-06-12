/**
 * Preact island hydration — runs in the browser.
 *
 * Inlined verbatim into the per-island bundle by compiler.js.
 * Must be self-contained: no Node-only imports, no captured closure variables.
 */

/**
 * @param {Element} container
 * @param {Record<string, unknown>} props
 * @param {import("preact").ComponentType<any>} Component
 */
export async function hydrate(container, props, Component) {
	const { h, hydrate } = await import("preact");
	hydrate(h(Component, props), container);
}
