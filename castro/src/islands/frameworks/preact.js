/**
 * Preact Framework Configuration
 *
 * This file is dynamically imported by framework-config.js only when
 * a Preact island is discovered. This isolation means adding a new
 * framework (e.g., Solid) is just creating a new file in this directory
 * with the same shape — no changes to core code needed.
 */

import { h } from "preact";
import { render } from "preact-render-to-string";

/**
 * @import * as preact from "preact"
 * @import { FrameworkConfig } from "./types.d.ts"
 */

/** @type {FrameworkConfig} */
export default {
	id: "preact",

	/**
	 * Bun.build settings for compiling Preact components.
	 * Uses automatic JSX transform so components don't need `import { h }`.
	 * Marks Preact packages as external — they're loaded via import map in the browser.
	 */
	getBuildConfig: () => ({
		jsx: { runtime: "automatic", importSource: "preact" },
		external: [
			"preact",
			"preact/hooks",
			"@preact/signals",
			"preact/jsx-runtime",
		],
	}),

	importMap: {
		preact: "https://esm.sh/preact",
		"preact/hooks": "https://esm.sh/preact/hooks",
		"@preact/signals": "https://esm.sh/@preact/signals?external=preact",
		"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
	},

	hydrateFnString: `
		const { h, hydrate } = await import("preact");
		hydrate(h(Component, props), container);
	`,

	renderSSR: (Component, props) =>
		render(h(/** @type {preact.ComponentType<any>} */ (Component), props)),
};
