/**
 * bare-jsx Framework Configuration
 *
 * A minimal JSX + signals framework using Castro's built-in runtime.
 * Unlike Preact and Solid which load from CDN, bare-jsx ships its ~2KB runtime
 * inside your dist folder — no external servers, no third-party CDNs.
 * The runtime is built once and shared across all bare-jsx islands via import map,
 * same mechanism Preact and Solid use, just pointing to a local file.
 *
 * This teaches how frameworks work by contrast: where Preact uses virtual DOM
 * diffing and Solid uses compiled reactive DOM operations, bare-jsx uses direct
 * DOM manipulation with reactive effects. The re-render hydration strategy
 * (clear and remount instead of walking existing DOM) makes the simplicity
 * vs. performance tradeoff visible.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Version-stamped filename for the bare-jsx runtime bundle. */
export const BARE_JSX_RUNTIME = `bare-jsx.${
	JSON.parse(
		readFileSync(
			join(dirname(import.meta.dir), "..", "..", "package.json"),
			"utf8",
		),
	).version
}.js`;

/**
 * @import { FrameworkConfig } from "./types.d.ts"
 */

const RUNTIME_DIR = join(dirname(import.meta.dir), "..", "..", "runtime");
const SIGNALS_DIR = join(RUNTIME_DIR, "signals");
const JSX_DIR = join(RUNTIME_DIR, "jsx");

/**
 * Bun.build plugin that wires up the bare-jsx runtime.
 *
 * Injects h() and Fragment imports into .jsx/.tsx files. Classic JSX
 * transform compiles <div> to h("div", ...) but doesn't auto-inject
 * imports like the "automatic" runtime does. This plugin handles it,
 * using Bun.Transpiler to override the project's tsconfig JSX settings.
 *
 * Why Bun.Transpiler? The project's tsconfig sets `jsx: "react-jsx"`
 * (automatic runtime for Preact). Per-file `@jsx` pragmas only work in
 * classic mode, and `@jsxImportSource` would need a jsx-runtime adapter
 * layer. The transpiler lets us compile with classic `h()` factory
 * directly — same pattern Solid uses with Babel.
 *
 * @param {"dom" | "ssr"} target
 * @returns {import("bun").BunPlugin}
 */
function bareJsxPlugin(target) {
	// Client builds use bare specifiers (resolved by import map in the browser).
	// SSR builds use absolute paths (resolved by Bun at build time).
	const runtimeImport =
		target === "ssr"
			? join(JSX_DIR, "ssr", "index.js")
			: "@vktrz/castro/runtime/jsx/dom";

	return {
		name: "bare-jsx",
		setup(build) {
			if (target === "ssr") {
				// SSR only: resolve @vktrz/castro imports to absolute paths
				// so they get bundled. The SSR build runs in Bun where
				// packages:"external" would otherwise externalize these —
				// but SSR needs the code inlined since there's no import map
				// in a Node/Bun environment.
				build.onResolve({ filter: /^@vktrz\/castro/ }, ({ path }) => {
					// Map package specifiers to absolute file paths in runtime/
					if (path === "@vktrz/castro/signals") {
						return { path: join(SIGNALS_DIR, "index.js") };
					}
					if (path === "@vktrz/castro/runtime/jsx/dom") {
						return { path: join(JSX_DIR, "dom", "index.js") };
					}
					if (path === "@vktrz/castro/runtime/jsx/ssr") {
						return { path: join(JSX_DIR, "ssr", "index.js") };
					}
					// Let other @vktrz/castro imports (e.g. type imports) pass through
					return undefined;
				});
			}

			// Transform JSX using Bun's transpiler with our h() factory.
			// Returns plain JS (loader: "js") so Bun's built-in JSX
			// transform doesn't re-process it with the project's tsconfig.
			build.onLoad({ filter: /\.[jt]sx$/ }, async ({ path }) => {
				const source = await Bun.file(path).text();
				const transpiler = new Bun.Transpiler({
					loader: path.endsWith(".tsx") ? "tsx" : "jsx",
					tsconfig: JSON.stringify({
						compilerOptions: {
							jsx: "react",
							jsxFactory: "h",
							jsxFragmentFactory: "Fragment",
						},
					}),
				});
				const code = transpiler.transformSync(
					`import { h, Fragment } from "${runtimeImport}";\n${source}`,
				);
				return { contents: code, loader: "js" };
			});
		},
	};
}

/** @type {FrameworkConfig} */
export default {
	id: "bare-jsx",

	/**
	 * Bun.build settings for bare-jsx islands.
	 * Uses classic JSX transform (explicit h() factory) instead of automatic
	 * (which would look for a jsx-runtime module). Client builds externalize
	 * the runtime — the browser loads it once via import map, shared across
	 * all bare-jsx islands on the page.
	 */
	getBuildConfig: (target) => ({
		jsx: { runtime: "classic", factory: "h", fragment: "Fragment" },
		plugins: [bareJsxPlugin(target ?? "dom")],
		external:
			target === "ssr"
				? []
				: ["@vktrz/castro/signals", "@vktrz/castro/runtime/jsx/dom"],
	}),

	importMap: {
		"@vktrz/castro/signals": `/${BARE_JSX_RUNTIME}`,
		"@vktrz/castro/runtime/jsx/dom": `/${BARE_JSX_RUNTIME}`,
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
