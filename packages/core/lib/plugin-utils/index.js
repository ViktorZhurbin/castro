/**
 * Core utilities for plugins
 *
 * These are optional helpers that plugins can use to simplify common tasks.
 * Plugins are free to implement their own versions if they need custom behavior.
 */

export { detectCustomElements } from "./detect-custom-elements.js";
export { filterUsedComponents } from "./filter-used-components.js";
export { generateScriptTag } from "./generate-script-tag.js";
export { generateTagsForUsedComponents } from "./generate-tags-for-used-components.js";
export { getElementName } from "./get-element-name.js";
export * from "./jsx-compiler-utils.js";
export { processJSXIslands } from "./process-jsx-islands.js";

// Types are available via JSDoc imports:
// @typedef {import('@vktrz/bare-static/plugin-utils/types.js').IslandComponent} IslandComponent
