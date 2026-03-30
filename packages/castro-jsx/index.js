/**
 * castro-jsx Plugin for Castro
 *
 * A minimal JSX + signals framework shipped as a standalone plugin.
 * Unlike Preact and Solid which load from CDN, castro-jsx bundles its
 * ~2KB runtime into your dist folder — no external servers, no third-party CDNs.
 * The runtime is built once and shared across all castro-jsx islands via import map.
 *
 * This demonstrates how the Castro plugin architecture enables third-party
 * frameworks to integrate seamlessly with the core SSG.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * @import { CastroPlugin, FrameworkConfig } from "@vktrz/castro"
 */

const PACKAGE_ROOT_DIR = dirname(import.meta.filename);
const SIGNALS_DIR = join(PACKAGE_ROOT_DIR, "signals");
const JSX_DIR = join(PACKAGE_ROOT_DIR, "jsx");

const version = JSON.parse(
	readFileSync(join(PACKAGE_ROOT_DIR, "package.json"), "utf8"),
).version;

const CASTRO_JSX_RUNTIME = `castro-jsx.${version}.js`;

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
 * @param {"dom" | "ssr"} target
 * @returns {import("bun").BunPlugin}
 */
function castroJsxPlugin(target) {
	// Client builds use bare specifiers (resolved by import map in the browser).
	// SSR builds use absolute paths (resolved by Bun at build time).
	const runtimeImport =
		target === "ssr" ? join(JSX_DIR, "ssr", "index.js") : "@vktrz/castro-jsx";

	return {
		name: "castro-jsx",
		setup(build) {
			if (target === "ssr") {
				// SSR only: resolve @vktrz/castro-jsx imports to absolute paths
				// so they get bundled. The SSR build runs in Bun where
				// packages:"external" would otherwise externalize these —
				// but SSR needs the code inlined since there's no import map
				// in a Node/Bun environment.
				build.onResolve({ filter: /^@vktrz\/castro-jsx/ }, ({ path }) => {
					// Map package specifiers to absolute file paths
					if (
						path === "@vktrz/castro-jsx" ||
						path === "@vktrz/castro-jsx/dom"
					) {
						return { path: join(JSX_DIR, "dom", "index.js") };
					}
					if (path === "@vktrz/castro-jsx/signals") {
						return { path: join(SIGNALS_DIR, "index.js") };
					}
					if (path === "@vktrz/castro-jsx/ssr") {
						return { path: join(JSX_DIR, "ssr", "index.js") };
					}
					// Let other @vktrz/castro-jsx imports (e.g. type imports) pass through
					return undefined;
				});
			}

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
					`import { createElement, Fragment } from "${runtimeImport}";\n${source}`,
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
		plugins: [castroJsxPlugin(target ?? "dom")],
		external:
			target === "ssr"
				? []
				: ["@vktrz/castro-jsx", "@vktrz/castro-jsx/signals"],
	}),

	importMap: {
		"@vktrz/castro-jsx": `/${CASTRO_JSX_RUNTIME}`,
		"@vktrz/castro-jsx/signals": `/${CASTRO_JSX_RUNTIME}`,
	},

	/**
	 * Client-side hydration: clear SSR HTML and mount fresh reactive DOM.
	 * Simpler than Preact's hydrate() (which walks existing DOM) or Solid's
	 * (which uses compiled markers). The tradeoff: a brief moment where the
	 * SSR HTML is replaced. For small islands this is imperceptible.
	 */
	hydrateFnString: `
		container.innerHTML = "";
		const dom = Component(props);
		if (dom instanceof Node) container.appendChild(dom);
	`,

	renderSSR: (Component, props) => {
		const result = Component(props);
		return result?.value ?? String(result);
	},
};

/**
 * Bundles the castro-jsx runtime into dist for browser loading.
 *
 * castro-jsx islands externalize their runtime imports (signals, h, Fragment)
 * and resolve them via import map → /castro-jsx.{version}.js. Only writes
 * when at least one page actually used a castro-jsx island.
 *
 * @returns {CastroPlugin}
 */
export function castroJsx() {
	return {
		name: "castro-jsx",
		frameworkConfig,

		async onAfterBuild({ usedFrameworks }) {
			if (!usedFrameworks.has("castro-jsx")) return;

			const entrypoint = join(JSX_DIR, "dom", "index.js");

			const result = await Bun.build({
				entrypoints: [entrypoint],
				format: "esm",
				target: "browser",
				minify: true,
			});

			if (result.success && result.outputs[0]) {
				await Bun.write(join("dist", CASTRO_JSX_RUNTIME), result.outputs[0]);
			}
		},
	};
}
