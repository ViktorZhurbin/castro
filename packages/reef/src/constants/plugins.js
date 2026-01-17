import { preactIslands } from "../islands/preact/index.js";
import { solidIslands } from "../islands/solid/index.js";

export const defaultPlugins = [solidIslands(), preactIslands()];
