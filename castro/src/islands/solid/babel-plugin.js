/**
 * Solid.js Babel Plugin
 *
 * A Bun build plugin that handles Solid JSX compilation via Babel.
 *
 * Why dynamic import? We want to support Solid as an optional framework.
 * If the user isn't using Solid, we don't want to require Babel dependencies
 * in the main package. The plugin only loads if user tries to use Solid islands.
 *
 * The plugin will fail gracefully with a clear error if Babel or Solid
 * dependencies aren't installed.
 *
 * Note: Babel dependencies are optional and listed as peer dependencies
 * for users who want Solid.js support. Knip ignores them via configuration.
 */

import { readFile } from "node:fs/promises";

/**
 * Get the Solid Babel plugin for Bun.build
 *
 * Creates a Bun plugin that compiles JSX using Babel with Solid presets.
 * Requires @babel/core, @babel/preset-typescript, and babel-preset-solid.
 *
 * @param {boolean} [ssr=false] - Whether to compile for SSR (server) or client
 * @returns {import('bun').BunPlugin}
 */
export function getSolidBabelPlugin(ssr = false) {
	return {
		name: "solid-babel",

		/**
		 * Intercept JSX/TSX file loads and compile with Babel
		 */
		setup(build) {
			build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
				try {
					const source = await readFile(args.path, "utf8");

					// Dynamic imports to avoid hard dependency on Babel
					// These will throw with clear error if not installed
					// @ts-ignore - optional dependency
					const babel = await import("@babel/core");
					// @ts-ignore - optional dependency
					const tsPreset = await import("@babel/preset-typescript");
					// @ts-ignore - optional dependency
					const solidPreset = await import("babel-preset-solid");

					const { code } = await babel.transformAsync(source, {
						filename: args.path,
						presets: [
							[
								solidPreset.default,
								ssr
									? { generate: "ssr", hydratable: true }
									: { generate: "dom", hydratable: false },
							],
							[tsPreset.default],
						],
					});

					return {
						contents: code || "",
						loader: "js",
					};
				} catch (err) {
					const error = /** @type {Error & {code?: string}} */ (err);

					// Provide helpful error message if dependencies are missing
					if (error.code === "ERR_MODULE_NOT_FOUND") {
						return {
							contents: `throw new Error("Solid.js requires Babel dependencies. Install: bun add -d @babel/core @babel/preset-typescript babel-preset-solid");`,
							loader: "js",
						};
					}

					throw error;
				}
			});
		},
	};
}
