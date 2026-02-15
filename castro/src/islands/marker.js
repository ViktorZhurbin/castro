/**
 * Island Marker Runtime
 *
 * This code runs at BUILD TIME when a page renders an island component.
 * It handles SSR rendering and wrapping islands in the <castro-island> custom element.
 *
 * Architecture:
 * 1. Registry lookup - Find the island's compiled code and pre-loaded SSR module
 * 2. Usage tracking - Mark island as used for CSS injection
 * 3. Directive processing - Handle lenin:awake, comrade:visible, no:pasaran
 * 4. SSR execution - Run the island's SSR module synchronously
 * 5. Wrapper generation - Wrap in <castro-island> or return static HTML
 */

import { h } from "preact";
import { messages } from "../messages/index.js";
import { frameworkConfig } from "./framework-config.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from "preact"
 * @import { Directive } from "../types.d.ts"
 */

/**
 * Tracks which islands are used during the current page render.
 * Helps make sure that only CSS for used islands gets included in the page
 * Reset before each page, populated by renderMarker()
 * @type {Set<string>}
 */
const usedIslands = new Set();

/**
 * Reset tracking for a new page render.
 */
export function resetUsedIslands() {
	usedIslands.clear();
}

/**
 * Get the set of islands used during the current page render.
 */
export function getUsedIslands() {
	return usedIslands;
}

/**
 * Render an island marker component
 *
 * Called synchronously by renderToString() during VNode tree traversal.
 * SSR modules are pre-loaded by the registry so no async work is needed here.
 *
 * @param {string} islandId - Unique island identifier (e.g., "components/Counter.island.tsx")
 * @param {Record<string, any>} props - Component props including directives
 * @returns {VNode}
 */
export function renderMarker(islandId, props = {}) {
	// Lookup island in registry
	const island = islands.getIsland(islandId);

	if (!island) {
		throw new Error(messages.errors.islandNotFoundRegistry(islandId));
	}

	usedIslands.add(islandId);

	// Extract directives and clean props
	const { directive, cleanProps } = processProps(props);

	// SSR Render
	let ssrHtml = "";

	try {
		// SSR module was pre-loaded by registry.load()
		const ssrModule = islands.getSSRModule(islandId);

		if (!ssrModule) {
			throw new Error(messages.errors.islandNotFoundRegistry(islandId));
		}

		ssrHtml = frameworkConfig.renderSSR(ssrModule.default, cleanProps);
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.error(messages.errors.islandRenderFailed(islandId, err.message));

		// Render the styled error fallback instead of crashing the build
		ssrHtml = frameworkConfig.renderSSR(SSRError, { islandId, error: err });
	}

	// Handle no:pasaran - static only, no hydration wrapper
	if (directive === "no:pasaran") {
		return h("div", {
			dangerouslySetInnerHTML: { __html: ssrHtml },
		});
	}

	// Return the custom element wrapper for client-side hydration
	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: ssrHtml },
	});
}

/** @type {Directive[]} */
const DIRECTIVES = ["lenin:awake", "comrade:visible", "no:pasaran"];
/** @type {Directive} */
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Extract and validate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
 */
function processProps(props = {}) {
	const foundDirectives = DIRECTIVES.filter((d) => d in props);

	if (foundDirectives.length > 1) {
		throw new Error(
			messages.errors.multipleDirectives(foundDirectives.join(", ")),
		);
	}

	// Create clean props (shallow copy) and remove directive
	const cleanProps = { ...props };

	if (foundDirectives.length > 0) {
		delete cleanProps[foundDirectives[0]];
	}

	return {
		cleanProps,
		directive: foundDirectives[0] ?? DEFAULT_DIRECTIVE,
	};
}

// ============================================================================
// SSR Error Fallback
// ============================================================================

/**
 * Styles for the SSR error boundary component
 * @type {{ container: Partial<CSSStyleDeclaration>, detail: Partial<CSSStyleDeclaration>, pre: Partial<CSSStyleDeclaration> }}
 */
const ERROR_STYLES = {
	container: {
		border: "2px dashed #c41e3a",
		padding: "1rem",
		color: "#c41e3a",
		background: "#fff0f0",
		fontFamily: "monospace",
		fontSize: "0.9em",
	},
	detail: {
		marginTop: "0.5rem",
		opacity: "0.8",
	},
	pre: {
		marginTop: "0.5rem",
		whiteSpace: "pre-wrap",
		wordBreak: "break-word",
		maxHeight: "150px",
		overflowY: "auto",
	},
};

/**
 * SSR error fallback component
 *
 * Renders a visible, themed error box when an island fails to SSR.
 * Keeps the build running while making the failure hard to miss.
 *
 * We use h() directly instead of JSX because this file runs as part of
 * Castro's build process, not through the page compilation pipeline.
 * marker.js is imported by compiled pages, so it must be plain JS.
 *
 * @param {{ islandId: string, error: Error }} props
 * @returns {VNode}
 */
function SSRError(props) {
	return h(
		"div",
		{ style: ERROR_STYLES.container },
		h("strong", null, messages.errors.ssrErrorTitle),
		h("div", { style: ERROR_STYLES.detail }, `Error in ${props.islandId}`),
		h("pre", { style: ERROR_STYLES.pre }, props.error.message),
	);
}
