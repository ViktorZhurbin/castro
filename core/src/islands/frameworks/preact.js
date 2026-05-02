/**
 * Preact Framework Configuration
 *
 * This file is dynamically imported by frameworkConfig.js only when
 * a Preact island is discovered. Adding a new framework means creating
 * a new file in this directory with the same shape, plus listing its
 * dependencies as optionalDependencies in package.json.
 */

import { h } from "preact";
import { render } from "preact-render-to-string";

/**
 * @import * as preact from "preact"
 * @import { FrameworkConfig } from "../../types.d.ts"
 */

/** @type {FrameworkConfig} */
export default {
	id: "preact",

	/**
	 * Bun.build settings for compiling Preact components.
	 * Uses automatic JSX transform so components don't need `import { h }`.
	 */
	getBuildConfig: () => ({
		jsx: { runtime: "automatic", importSource: "preact" },
	}),

	clientDependencies: ["preact", "preact/hooks", "preact/jsx-runtime"],

	detectImports: ["preact"],

	hydrateClientPath: new URL("./preact.client.js", import.meta.url).pathname,

	renderSSR: (Component, props) =>
		render(h(/** @type {preact.ComponentType<any>} */ (Component), props)),
};
