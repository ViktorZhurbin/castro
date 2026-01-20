import { OUTPUT_DIR } from "../../../constants/dir.js";
import { wrapWithIsland } from "../../../utils/wrap-with-island.js";
import { FrameworkConfig } from "../framework-config.js";
import { processJSXIslands } from "./process-jsx-islands.js";

/**
 * @import { IslandPluginOptions, IslandComponent, SupportedFramework, ImportMap } from '../../../types/island.js';
 * @import { ReefPlugin,  PluginBuildContext, PluginTransformContext } from '../../../types/plugin.js';
 */

/**
 * Factory function to create island plugins for different frameworks
 *
 * @param {Object} params
 * @param {SupportedFramework} params.framework
 * @returns {(options?: IslandPluginOptions) => ReefPlugin} Plugin factory
 */
export function createIslandPlugin({ framework }) {
	const { defaultDir, importMap } = FrameworkConfig[framework];
	/**
	 * @param {IslandPluginOptions} [options] - Plugin configuration
	 * @returns {ReefPlugin} Plugin instance with hooks
	 */
	return (options = {}) => {
		const { sourceDir = defaultDir } = options;

		/** @type {IslandComponent[]} */
		let discoveredComponents = [];

		return {
			name: `islands-${framework}`,

			// Watch islands directory for changes in dev mode
			watchDirs: [sourceDir],

			/**
			 * Hook: Called during build to discover, compile, and copy components
			 * @param {PluginBuildContext} context - Build context
			 */
			async onBuild({ outputDir = OUTPUT_DIR }) {
				discoveredComponents = await processJSXIslands({
					sourceDir,
					outputDir,
					framework,
				});
			},

			/**
			 * Hook: Returns import map configuration for framework runtime from CDN
			 * @returns {Promise<ImportMap | null>} Import map config or null
			 */
			async getImportMap() {
				if (discoveredComponents.length === 0) return null;

				return importMap;
			},

			/**
			 * Hook: Transform HTML to wrap components in <reef-island> tags and render SSR
			 * @param {PluginTransformContext} context - Transform context
			 * @returns {Promise<string>} Transformed HTML
			 */
			async transform({ content }) {
				if (discoveredComponents.length === 0) return content;

				return await wrapWithIsland(
					content,
					discoveredComponents,
					"on:visible",
				);
			},
		};
	};
}
