import { reefIsland } from "./islands/reef-island/plugin.js";
import { createIslandPlugin } from "./islands/utils/create-island-plugin.js";

const solidPlugin = createIslandPlugin({ framework: "solid" });
const preactPlugin = createIslandPlugin({ framework: "preact" });

export const defaultPlugins = [
	reefIsland(), // Load reef-island custom element
	solidPlugin(),
	preactPlugin(),
];
