import { preactIslands } from "./islands/preact/plugin.js";
import { reefIsland } from "./islands/reef-island/plugin.js";
import { solidIslands } from "./islands/solid/plugin.js";

export const defaultPlugins = [
	reefIsland(), // Load reef-island custom element
	solidIslands(),
	preactIslands(),
];
