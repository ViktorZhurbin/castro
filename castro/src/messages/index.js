/**
 * The Ministry of Messages
 *
 * Selects the active message preset based on user configuration.
 */

import { config } from "../config.js";
import { satirical } from "./communist.js";
import { serious } from "./serious.js";

/** @type {Record<string, import("./messages.d.ts").Messages>} */
const presets = { satirical, serious };

export const messages = presets[config.messages] ?? satirical;
