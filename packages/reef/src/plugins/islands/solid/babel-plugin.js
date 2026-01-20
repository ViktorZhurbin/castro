import { readFile } from "node:fs/promises";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";

/**
 * A tiny plugin to handle Solid JSX via Babel
 * @type { (ssr?: boolean) => import("esbuild").Plugin }
 */
export const getSolidBabelPlugin = (ssr) => ({
	name: "solid-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await readFile(args.path, "utf8");

			const { code } = await import("@babel/core").then((babel) =>
				babel.transformAsync(source, {
					filename: args.path,
					presets: [
						[
							solidPreset,
							ssr
								? { generate: "ssr", hydratable: true }
								: { generate: "dom", hydratable: false },
						],
						[tsPreset],
					],
				}),
			);

			return { contents: code, loader: "js" };
		});
	},
});
