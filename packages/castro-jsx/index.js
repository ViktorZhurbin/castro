/**
 * castro-jsx Plugin for Castro
 *
 * A minimal JSX + signals framework shipped as a standalone plugin.
 *
 * This demonstrates how the Castro plugin architecture enables third-party
 * frameworks to integrate seamlessly with the core SSG.
 */

/**
 * @import { CastroPlugin, FrameworkConfig } from "@vktrz/castro"
 */

/**
 * Bun.build plugin that wires up the castro-jsx runtime.
 *
 * Injects createElement() and Fragment imports into .jsx/.tsx files. Classic JSX
 * transform compiles <div> to createElement("div", ...) but doesn't auto-inject
 * imports like the "automatic" runtime does. This plugin handles it,
 * using Bun.Transpiler to override the project's tsconfig JSX settings.
 *
 * Why Bun.Transpiler? The project's tsconfig sets `jsx: "react-jsx"`
 * (automatic runtime for Preact). Per-file `@jsx` pragmas only work in
 * classic mode, and `@jsxImportSource` would need a jsx-runtime adapter
 * layer. The transpiler lets us compile with classic `createElement()` factory
 * directly — same pattern Solid uses with Babel.
 *
 * @param {"dom" | "ssr" | undefined} target
 * @returns {import("bun").BunPlugin}
 */
function castroJsxPlugin(target = "dom") {
	return {
		name: "castro-jsx",
		setup(build) {
			// Transform JSX using Bun's transpiler with our createElement() factory.
			// Returns plain JS (loader: "js") so Bun's built-in JSX
			// transform doesn't re-process it with the project's tsconfig.
			build.onLoad({ filter: /\.[jt]sx$/ }, async ({ path }) => {
				const source = await Bun.file(path).text();

				const transpiler = new Bun.Transpiler({
					loader: path.endsWith(".tsx") ? "tsx" : "jsx",
					tsconfig: JSON.stringify({
						compilerOptions: {
							jsx: "react",
							jsxFactory: "createElement",
							jsxFragmentFactory: "Fragment",
						},
					}),
				});

				const code = transpiler.transformSync(
					`import { createElement, Fragment } from "@vktrz/castro-jsx/${target}";\n${source}`,
				);
				return { contents: code, loader: "js" };
			});
		},
	};
}

/** @type {FrameworkConfig} */
const frameworkConfig = {
	id: "castro-jsx",

	/**
	 * Bun.build settings for castro-jsx islands.
	 * Uses classic JSX transform (explicit createElement() factory) instead of automatic
	 * (which would look for a jsx-runtime module). Client builds externalize
	 * the runtime — the browser loads it once via import map, shared across
	 * all castro-jsx islands on the page.
	 */
	getBuildConfig: (target) => ({
		jsx: { runtime: "classic", factory: "createElement", fragment: "Fragment" },
		plugins: [castroJsxPlugin(target)],
	}),

	clientDependencies: ["@vktrz/castro-jsx/dom", "@vktrz/castro-jsx/signals"],

	detectImports: ["@vktrz/castro-jsx"],

	hydrateClientPath: new URL("./hydrate.client.js", import.meta.url).pathname,

	renderSSR: (Component, props) => {
		const result = Component(props);
		return result?.value ?? String(result);
	},
};

/**
 * Register the castro-jsx framework.
 *
 * @returns {CastroPlugin}
 */
export function castroJsx() {
	return {
		name: "castro-jsx",
		frameworkConfig,
	};
}
