/**
 * Island Marker
 *
 * Called synchronously during renderToString() when the VNode tree hits
 * an island component. The build-plugins replaced the real island import
 * with a stub that calls renderMarker(), which:
 *
 * 1. Looks up the island's pre-loaded SSR module in the registry
 * 2. Renders it to HTML (server-side)
 * 3. Wraps it in a <castro-island> custom element for client hydration
 *
 * Also tracks which islands each page uses, so only their CSS gets injected.
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
 * Per-page island tracking. Reset before each page render.
 * - usedIslands: all rendered islands (determines CSS injection)
 * - needsHydration: true if at least one island isn't no:pasaran (determines runtime script)
 */
export const pageState = {
	/** @type {Set<string>} */
	usedIslands: new Set(),
	needsHydration: false,

	reset() {
		this.usedIslands.clear();
		this.needsHydration = false;
	},
};

/**
 * Render an island marker component
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @param {Record<string, any>} props - Component props including directives
 * @returns {VNode}
 */
export function renderMarker(islandId, props = {}) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new Error(messages.errors.islandNotFoundRegistry(islandId));
	}

	const { directive, cleanProps } = processProps(props);

	pageState.usedIslands.add(islandId);
	if (directive !== "no:pasaran") {
		pageState.needsHydration = true;
	}

	let ssrHtml = "";

	try {
		ssrHtml = frameworkConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.error(messages.errors.islandRenderFailed(islandId, err.message));

		ssrHtml = frameworkConfig.renderSSR(SSRError, { islandId, error: err });
	}

	// no:pasaran = static only, no hydration wrapper
	if (directive === "no:pasaran") {
		return h("div", {
			dangerouslySetInnerHTML: { __html: ssrHtml },
		});
	}

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
 * Renders a visible error box when an island fails to SSR.
 * Keeps the build running while making the failure hard to miss.
 *
 * Uses h() directly because this file is imported by compiled pages
 * as plain JS — it doesn't go through the JSX compilation pipeline.
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
