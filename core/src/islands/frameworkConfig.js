/**
 * Framework Config Registry
 *
 * Two built-in frameworks, registered statically — no user-provided plugins,
 * no dynamic loading. Preact is the default; castro-jsx opts in per-island
 * via its import (see detectFramework() in registry.js).
 */

import {
	CASTRO_JSX_CLIENT_DEPS,
	CASTRO_JSX_CLIENT_PATH,
	renderIslandToString as renderCastroJsxToString,
} from "./castroJsx.js";
import {
	PREACT_BUILD_CONFIG,
	PREACT_CLIENT_DEPS,
	PREACT_CLIENT_PATH,
	renderIslandToString as renderPreactToString,
} from "./preact.js";

/**
 * @import { FrameworkConfig } from "../types.d.ts"
 */

/** @type {FrameworkConfig} */
const preactConfig = {
	id: "preact",
	getBuildConfig: () => PREACT_BUILD_CONFIG,
	clientDependencies: PREACT_CLIENT_DEPS,
	detectImports: ["preact"],
	hydrateClientPath: PREACT_CLIENT_PATH,
	renderSSR: renderPreactToString,
};

/** @type {FrameworkConfig} */
const castroJsxConfig = {
	id: "castro-jsx",
	// No jsx build-config override — island source files carry their own
	// classic-mode pragma (see castroJsx.js docblock).
	getBuildConfig: () => ({}),
	clientDependencies: CASTRO_JSX_CLIENT_DEPS,
	detectImports: ["@vktrz/castro-jsx"],
	hydrateClientPath: CASTRO_JSX_CLIENT_PATH,
	renderSSR: renderCastroJsxToString,
};

/** @type {Map<string, FrameworkConfig>} */
const frameworkConfigs = new Map(
	[preactConfig, castroJsxConfig].map((config) => [config.id, config]),
);

export const DEFAULT_FRAMEWORK_ID = preactConfig.id;

/**
 * Get a framework config synchronously. Throws if the id wasn't registered
 * above — a Castro bug, not a user-facing error.
 *
 * @param {string} id
 * @returns {FrameworkConfig}
 */
export function getFrameworkConfig(id) {
	const frameworkConfig = frameworkConfigs.get(id);

	if (!frameworkConfig) {
		throw new Error(`Framework "${id}" is not registered. This is a Castro bug.`);
	}

	return frameworkConfig;
}

/**
 * All registered frameworks. Used during island discovery to match
 * frameworks against AST import scans.
 *
 * @returns {FrameworkConfig[]}
 */
export function getAllFrameworkConfigs() {
	return Array.from(frameworkConfigs.values());
}
