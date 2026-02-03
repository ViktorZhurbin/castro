/**
 * JSX Island Wrapper
 *
 * Wraps island components for client-side hydration using Preact's options.vnode hook.
 *
 * How island detection works:
 * 1. Islands are detected at build time and registered
 * 2. During page render, we intercept VNode creation via options.vnode hook
 * 3. When an island component is encountered, we replace it with a wrapper
 * 4. The wrapper renders static HTML and wraps it in <castro-island> for hydration
 */

import { join } from "node:path";
import { h, options } from "preact";
import { renderToString } from "preact-render-to-string";
import { compileJSX } from "../builder/compile-jsx.js";
import { messages } from "../messages/index.js";
import { islands } from "./registry.js";

/**
 * @import { Directive } from '../types.js'
 */

/**
 * Island wrapper that uses Preact's options.vnode hook to intercept
 * and wrap island components during VNode creation.
 */
class IslandWrapper {
	/** @type {Directive[]} */
	static DIRECTIVES = ["lenin:awake", "comrade:visible", "no:pasaran"];
	/** @type {Directive} */
	static DEFAULT_DIRECTIVE = "comrade:visible";

	/** Store original vnode hook to restore after rendering */
	#originalHook = options.vnode;
	/** Track whether the hook is currently installed */
	#hookInstalled = false;
	/** Track whether we're rendering static HTML (prevents infinite recursion) */
	#renderingStatic = false;
	/** @type {any} Cached compiled error fallback component */
	#ErrorComponent = null;

	/**
	 * Install the island detection hook
	 * @returns {Promise<Set<string>>}
	 */
	async install() {
		/** @type {Set<string>} */
		const usedIslands = new Set();

		// Prevent double-installation
		if (this.#hookInstalled) return usedIslands;
		this.#hookInstalled = true;

		// Compile the error fallback component on first use
		if (!this.#ErrorComponent) {
			const fallbackPath = join(
				import.meta.dirname,
				"wrapper-error-boundary.tsx",
			);
			const { module } = await compileJSX(fallbackPath);
			this.#ErrorComponent = module.default;
		}

		// Install our island detection hook
		options.vnode = (vnode) => {
			// Skip wrapping if we're currently rendering static HTML
			// (prevents infinite recursion when the wrapper renders the island)
			if (this.#renderingStatic) {
				if (this.#originalHook) this.#originalHook(vnode);
				return;
			}

			// Check if this VNode is a component (function) and if it's a known island
			if (typeof vnode.type !== "function") {
				if (this.#originalHook) this.#originalHook(vnode);
				return;
			}

			// Check for the injected island ID (set by the tagging plugin in compile-jsx.js)
			// ID format: "src/islands/Counter.tsx"
			// @ts-expect-error: islandId is a custom property added by Castro
			const islandId = vnode.type.islandId;

			if (islandId && islands.isIsland(islandId)) {
				// Capture the original component before we replace it
				const OriginalComponent = vnode.type;

				// Replace the component type with a wrapper HOC
				// This wrapper will be called by Preact when rendering this VNode
				vnode.type = (props) => {
					const island = islands.getIsland(islandId);

					if (!island) {
						throw new Error(messages.errors.islandNotFoundRegistry(islandId));
					}

					// Track this island's usage for CSS manifest lookup
					// Store the ID so we can look up CSS in the manifest
					usedIslands.add(islandId);

					// Extract directives and clean props
					const { directive, cleanProps } = this.#processProps(props);

					// Render the original component to static HTML
					/** @type {string} */
					let staticHtml;

					// Set flag to prevent the hook from wrapping this render
					this.#renderingStatic = true;

					try {
						staticHtml = renderToString(h(OriginalComponent, cleanProps));
					} catch (e) {
						const err = /** @type {Error} */ (e);

						// Log the error for developer visibility, but don't crash the build
						console.error(
							messages.errors.islandRenderFailed(islandId, err.message),
						);

						// Render the compiled error fallback component
						return h(this.#ErrorComponent, {
							islandId,
							error: err,
						});
					} finally {
						this.#renderingStatic = false;
					}

					// Handle no:pasaran - static only, no hydration wrapper
					if (directive === "no:pasaran") {
						return h("div", {
							dangerouslySetInnerHTML: { __html: staticHtml },
						});
					}

					// Return the custom element wrapper for client-side hydration
					return h("castro-island", {
						directive,
						import: island.publicJsPath,
						"data-props": JSON.stringify(cleanProps),
						dangerouslySetInnerHTML: { __html: staticHtml },
					});
				};
			}

			// Chain the previous hook if it existed
			if (this.#originalHook) this.#originalHook(vnode);
		};

		return usedIslands;
	}

	/**
	 * Uninstall the island detection hook
	 *
	 * Restores the original vnode hook (if any) that was present
	 * before we installed ours.
	 */
	uninstall() {
		if (!this.#hookInstalled) return;
		this.#hookInstalled = false;
		options.vnode = this.#originalHook;
	}

	/**
	 * Extract and validate directive from props
	 *
	 * @param {Record<string, any> | undefined} props
	 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
	 */
	#processProps(props = {}) {
		const foundDirectives = IslandWrapper.DIRECTIVES.filter((d) => d in props);

		if (foundDirectives.length > 1) {
			throw new Error(
				messages.errors.multipleDirectives(foundDirectives.join(", ")),
			);
		}

		// 2. Create clean props (shallow copy) and remove directive
		const cleanProps = { ...props };
		if (foundDirectives.length > 0) {
			delete cleanProps[foundDirectives[0]];
		}

		return {
			cleanProps,
			directive: foundDirectives[0] ?? IslandWrapper.DEFAULT_DIRECTIVE,
		};
	}
}

// Export singleton instance
export const islandWrapper = new IslandWrapper();
