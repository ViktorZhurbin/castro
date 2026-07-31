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
 * Also records which islands the page uses (into the per-page state from
 * pageState.js), so only their CSS gets injected.
 *
 * Islands take props, never children: everything crossing into the browser
 * goes through the `data-props` JSON, so children are rejected here rather
 * than quietly dropped at hydration.
 */

import { h } from "preact";
import { CastroError } from "../utils/errors.js";
import { getPageState } from "./pageState.js";
import { renderIslandToString } from "./preact.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from "preact"
 * @import { Directive, IslandComponent } from "../types.d.ts"
 *
 * @typedef {IslandComponent & { ssrModule: NonNullable<IslandComponent["ssrModule"]> }} LoadedIsland
 */

/**
 * Render an island marker component.
 *
 * Three steps, each in its own function below: look the island up, render its
 * SSR HTML, wrap the result in a <castro-island> VNode for client hydration.
 *
 * @param {string} islandId - e.g., "components/Counter.island.tsx"
 * @param {Record<string, any>} props - Component props including directives
 * @returns {VNode}
 */
export function renderMarker(islandId, props = {}) {
	// Read before the lookup so every island error below can name the page.
	const state = getPageState();
	const island = lookupIsland(islandId, state.sourceFilePath);
	const { directive, cleanProps } = processProps(props);

	state.usedIslands.add(islandId);

	// The rule is all children, not just unserializable ones. A string child
	// would survive the JSON trip and a VNode wouldn't; one flat rule beats an
	// API where nesting works until the day it doesn't.
	//
	// Rejected here rather than left to serializeProps because whether a VNode
	// is cyclic depends on whether the SSR pass traversed it — an island that
	// ignores its children would serialize Preact's internals into data-props
	// and fail in the browser instead of throwing during the build.
	if ("children" in cleanProps) {
		throw new CastroError("ISLAND_HAS_CHILDREN", {
			islandId,
			sourceFilePath: state.sourceFilePath,
		});
	}

	const ssrHtml = renderIslandSSR(
		island,
		islandId,
		cleanProps,
		state.sourceFilePath,
	);
	const dataProps = serializeProps(islandId, cleanProps, state.sourceFilePath);

	/**
	 * Build the <castro-island> VNode that the hydration runtime upgrades in the
	 * browser. The SSR HTML is injected as the element's children so the page is
	 * interactive-looking before any JS runs.
	 */
	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": dataProps,
		dangerouslySetInnerHTML: { __html: ssrHtml },
	});
}

/**
 * Look up a compiled island and assert its SSR module is loaded.
 *
 * @param {string} islandId
 * @param {string} sourceFilePath
 * @returns {LoadedIsland}
 */
function lookupIsland(islandId, sourceFilePath) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new CastroError("ISLAND_NOT_FOUND", { islandId, sourceFilePath });
	}

	return /** @type {LoadedIsland} */ (island);
}

/**
 * Render the island's pre-loaded SSR module to static HTML. Wraps any throw in
 * a CastroError so the build surfaces a structured error instead of a raw stack.
 *
 * @param {LoadedIsland} island
 * @param {string} islandId
 * @param {Record<string, any>} cleanProps
 * @param {string} sourceFilePath
 * @returns {string}
 */
function renderIslandSSR(island, islandId, cleanProps, sourceFilePath) {
	try {
		return renderIslandToString(island.ssrModule.default, cleanProps);
	} catch (err) {
		throw new CastroError("ISLAND_RENDER_FAILED", {
			islandId,
			sourceFilePath,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}

/**
 * Serialize props into the client's `data-props` attribute, wrapping any throw
 * in a CastroError so a bad prop names its island instead of surfacing as a
 * raw V8 message.
 *
 * @param {string} islandId
 * @param {Record<string, any>} cleanProps
 * @param {string} sourceFilePath
 * @returns {string}
 */
function serializeProps(islandId, cleanProps, sourceFilePath) {
	try {
		return JSON.stringify(cleanProps);
	} catch (err) {
		throw new CastroError("ISLAND_PROPS_NOT_SERIALIZABLE", {
			islandId,
			sourceFilePath,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}

/** @type {Directive[]} */
const DIRECTIVES = ["comrade:eager", "comrade:patient", "comrade:visible"];
/** @type {Directive} */
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Separate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
 */
function processProps(props = {}) {
	// Matched by value, not key presence: the directives are typed `boolean`, so
	// `comrade:eager={false}` is valid TS that has to read as off, not as on.
	const specifiedDirective = DIRECTIVES.find((d) => props[d]);

	const cleanProps = { ...props };
	for (const directive of DIRECTIVES) {
		delete cleanProps[directive];
	}

	return { cleanProps, directive: specifiedDirective ?? DEFAULT_DIRECTIVE };
}
