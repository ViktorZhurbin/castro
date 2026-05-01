/**
 * The Ministry of Messages
 *
 * Selects the active message preset based on user configuration.
 */

import { config } from "../config.js";
import { satirical } from "./satirical.js";
import { serious } from "./serious.js";

/** @import { Messages } from "./messages.d.ts" */

/** @type {Record<"satirical" | "serious", Messages>} */
const presets = { satirical, serious };

export const messages = presets[config.messages] ?? satirical;
