import fsPromises from "node:fs/promises";
import path from "node:path";
import * as babel from "@babel/core";
import tsPreset from "@babel/preset-typescript";
import * as esbuild from "esbuild";

/**
 * A tiny esbuild plugin to handle Preact JSX via Babel
 */
const preactBabelPlugin = {
	name: "preact-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await fsPromises.readFile(args.path, "utf8");

			const { code } = await babel.transformAsync(source, {
				filename: args.path,
				presets: [[tsPreset]],
				plugins: [
					[
						"@babel/plugin-transform-react-jsx",
						{
							runtime: "automatic",
							importSource: "preact",
						},
					],
				],
			});

			return { contents: code, loader: "js" };
		});
	},
};

export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	const absoluteSourcePath = path.resolve(sourcePath);
	const sourceFileName = path.basename(absoluteSourcePath);

	/**
	 * Virtual entry for Preact using preact-custom-element
	 * Much simpler than Solid version - register() handles everything
	 */
	const virtualEntry = `
    import register from 'preact-custom-element';
    import Component from './${sourceFileName}';

    // Register component as custom element
    // Empty array = no observed attributes (or infer from propTypes)
    // shadow: false = no shadow DOM (consistent with Solid version)
    register(Component, '${elementName}', [], { shadow: false });
  `.trim();

	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: path.dirname(absoluteSourcePath),
			loader: "js",
		},
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		plugins: [preactBabelPlugin],
		external: [
			"preact",
			"preact/hooks",
			"preact/jsx-runtime",
			"preact-custom-element",
		],
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, result.outputFiles[0].text);
}
