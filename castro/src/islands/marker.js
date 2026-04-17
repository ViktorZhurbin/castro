/**
 * Island Marker
 *
 * Called synchronously during renderToString() when the VNode tree hits
 * an island component. The buildPlugins replaced the real island import
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
import { CastroError } from "../utils/errors.js";
import { renderErrorToTerminal } from "../utils/renderError.js";
import { getFrameworkConfig } from "./frameworkConfig.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from "preact"
 * @import { Directive } from "../types.d.ts"
 */

/**
 * Per-page island tracking. Reset before each page render.
 * - usedIslands: all rendered islands (determines CSS injection and runtime injection)
 * - usedFrameworks: framework IDs encountered (determines which runtimes to emit)
 *
 * Safe as a module-level singleton because renderToString() is synchronous
 * and buildAll.js processes pages sequentially. Parallelizing page builds
 * (e.g. Promise.all) would cause race conditions here — pages would overwrite
 * each other's state. Fix would be AsyncLocalStorage or passing state explicitly.
 */
export const pageState = {
	/** @type {Set<string>} */
	usedIslands: new Set(),
	/** @type {Set<string>} */
	usedFrameworks: new Set(),

	reset() {
		this.usedIslands.clear();
		this.usedFrameworks.clear();
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
		throw new CastroError("ISLAND_NOT_FOUND", { islandId });
	}

	// Each island carries its framework id from compilation.
	// Resolve the config synchronously from the pre-loaded cache.
	const frameworkConfig = getFrameworkConfig(island.frameworkId);

	const { directive, cleanProps } = processProps(props);

	pageState.usedIslands.add(islandId);
	pageState.usedFrameworks.add(island.frameworkId);

	let ssrHtml = "";

	try {
		ssrHtml = frameworkConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		const ssrErrPayload = new CastroError("ISLAND_RENDER_FAILED", {
			islandId,
			error: err.message,
		}).castroPayload;
		console.error(renderErrorToTerminal(ssrErrPayload));

		// Error fallback always uses Preact's renderSSR since the SSRError
		// component is a Preact component (uses h() from preact)
		const defaultConfig = getFrameworkConfig("preact");
		ssrHtml = defaultConfig.renderSSR(SSRError, { islandId, error: err });
	}

	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: ssrHtml },
	});
}

/** @type {Directive[]} */
const DIRECTIVES = ["comrade:eager", "comrade:patient", "comrade:visible"];
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
		throw new CastroError("MULTIPLE_DIRECTIVES", {
			directives: foundDirectives,
		});
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
		h("strong", null, messages.ssrErrorTitle),
		h("div", { style: ERROR_STYLES.detail }, `Error in ${props.islandId}`),
		h("pre", { style: ERROR_STYLES.pre }, props.error.message),
	);
}
