/**
 * The Ministry of Messages
 *
 * Selects the active message preset based on user configuration.
 * Defaults to the satirical (communist) preset.
 *
 * Exported as a live binding so the dev server can hot-swap presets
 * when castro.config.js changes, without touching any consumer imports.
 */

import { config } from "../config.js";
import { satirical } from "./communist.js";
import { serious } from "./serious.js";

/** @type {Record<string, import("./messages.d.ts").Messages>} */
const presets = { satirical, serious };

/** @type {import("./messages.d.ts").Messages} */
export let messages = presets[config.messages] ?? satirical;

/**
 * Re-select the message preset after config reload.
 * Called by the dev server when castro.config.js changes.
 */
export function reloadMessages() {
	messages = presets[config.messages] ?? satirical;
}
