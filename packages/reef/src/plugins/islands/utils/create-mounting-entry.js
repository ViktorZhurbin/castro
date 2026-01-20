import { basename } from "node:path";
/**
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * Creates mounting function wrapper for framework components
 * @param {string} sourcePath - Path to the component file
 * @param {SupportedFramework} framework
 */
export function createMountingEntry(sourcePath, framework) {
	const componentImport = `import Component from './${basename(sourcePath)}';`;

	let renderFn = "";

	switch (framework) {
		case "preact": {
			renderFn = `
				export default async (container) => {
					const { h, hydrate } = await import("preact");
					const props = getDataAttributes(container.attributes);
					hydrate(h(Component, props), container);
				}
			`;

			break;
		}

		case "solid": {
			renderFn = `
				export default async (container) => {
					const { hydrate } = await import("solid-js/web");
					const props = getDataAttributes(container.attributes);
					hydrate(() => Component(props), container);
				}
			`;

			break;
		}
	}

	if (!renderFn) {
		throw new Error(`Unknown framework: ${framework}`);
	}

	return [componentImport, renderFn, getDataAttributes.toString()]
		.map((item) => item.trim())
		.join("\n");
}

// Extract props from data-* attributes
function getDataAttributes(attributes) {
	const props = {};

	const DATA_PREFIX = "data-";
	for (const attr of attributes) {
		if (attr.name.startsWith(DATA_PREFIX)) {
			const propName = attr.name.slice(DATA_PREFIX.length);
			props[propName] = attr.value;
		}
	}

	return props;
}
