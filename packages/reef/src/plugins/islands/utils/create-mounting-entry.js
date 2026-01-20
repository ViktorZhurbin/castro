import { basename } from "node:path";
import { FrameworkConfig } from "../framework-config.js";
import { CLIENT_RUNTIME_ALIAS } from "../reef-island/plugin.js";
/**
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * Creates mounting function wrapper for framework components
 * @param {string} sourcePath - Path to the component file
 * @param {SupportedFramework} framework
 */
export function createMountingEntry(sourcePath, framework) {
	const config = FrameworkConfig[framework];
	const componentImport = `import Component from './${basename(sourcePath)}';`;
	const helpersImport = `import { getPropsFromAttributes } from '${CLIENT_RUNTIME_ALIAS}';`;

	const hydrateFn = `
		export default async (container) => {
			const props = getPropsFromAttributes(container.attributes);
			${config.hydrateFnString}
		}
	`;

	return [componentImport, helpersImport, hydrateFn]
		.map((item) => item.trim())
		.join("\n");
}
