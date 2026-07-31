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
 * @typedef {{ islandId: string, sourceFilePath: string }} IslandErrorTokens
 * The pair every island error carries: which island, and the page rendering it.
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
  // Built once up front so every throw below names both the island and the page.
  const state = getPageState();
  /** @type {IslandErrorTokens} */
  const errorTokens = { islandId, sourceFilePath: state.sourceFilePath };

  const island = lookupIsland(errorTokens);
  const { directive, cleanProps } = processProps(props, errorTokens);

  state.usedIslands.add(islandId);

  // Rejected here rather than left to serializeProps because whether a VNode
  // is cyclic depends on whether the SSR pass traversed it — an island that
  // ignores its children would serialize Preact's internals into data-props
  // and fail in the browser instead of throwing during the build.
  //
  // Matched by value, and the value that matters is `false`: `{cond && <X />}`
  // leaves `children: false` when cond is false, which every conditional
  // render produces and which must not throw. null/undefined get the same
  // pass. Everything else is a nesting attempt and is rejected on sight —
  // including `[]` from an empty `.map()`, which nested nothing either but
  // isn't worth a second arm to tell apart.
  const { children } = cleanProps;
  if (children != null && children !== false) {
    throw new CastroError("ISLAND_HAS_CHILDREN", errorTokens);
  }

  const ssrHtml = renderIslandSSR(island, cleanProps, errorTokens);
  const dataProps = serializeProps(cleanProps, errorTokens);

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
 * Look up a compiled island.
 *
 * @param {IslandErrorTokens} errorTokens
 * @returns {IslandComponent}
 */
function lookupIsland(errorTokens) {
  const island = islands.getIsland(errorTokens.islandId);

  if (!island) {
    throw new CastroError("ISLAND_NOT_FOUND", errorTokens);
  }

  return island;
}

/**
 * Render the island's pre-loaded SSR module to static HTML. Wraps any throw in
 * a CastroError so the build surfaces a structured error instead of a raw stack.
 *
 * @param {IslandComponent} island
 * @param {Record<string, any>} cleanProps
 * @param {IslandErrorTokens} errorTokens
 * @returns {string}
 */
function renderIslandSSR(island, cleanProps, errorTokens) {
  try {
    return renderIslandToString(island.ssrModule.default, cleanProps);
  } catch (err) {
    throw new CastroError("ISLAND_RENDER_FAILED", {
      ...errorTokens,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Serialize props into the client's `data-props` attribute, wrapping any throw
 * in a CastroError so a bad prop names its island instead of surfacing as a
 * raw V8 message.
 *
 * @param {Record<string, any>} cleanProps
 * @param {IslandErrorTokens} errorTokens
 * @returns {string}
 */
function serializeProps(cleanProps, errorTokens) {
  try {
    return JSON.stringify(cleanProps);
  } catch (err) {
    throw new CastroError("ISLAND_PROPS_NOT_SERIALIZABLE", {
      ...errorTokens,
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
 * @param {Record<string, any>} props
 * @param {IslandErrorTokens} errorTokens
 * @returns {{ directive: Directive, cleanProps: Record<string, any> }}
 */
function processProps(props, errorTokens) {
  const specified = DIRECTIVES.filter((d) => d in props);

  // Each directive is independently optional in the JSX types, so nothing stops
  // an island carrying two. Picking one by array order would silently demote a
  // directive the author wrote on purpose.
  if (specified.length > 1) {
    throw new CastroError("ISLAND_MULTIPLE_DIRECTIVES", {
      ...errorTokens,
      directives: specified,
    });
  }

  const cleanProps = { ...props };
  for (const directive of DIRECTIVES) {
    delete cleanProps[directive];
  }

  return { cleanProps, directive: specified[0] ?? DEFAULT_DIRECTIVE };
}
