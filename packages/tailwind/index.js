/**
 * Castro Tailwind Plugin
 *
 * Integrates Tailwind CSS into Castro's build pipeline.
 * Processes CSS files through PostCSS with @tailwindcss/postcss,
 * writes compiled output to dist/, and auto-injects <link> tags.
 */

import { basename, dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

/**
 * @import { CastroPlugin } from "@vktrz/castro";
 */

/**
 * @param {{ input: string | string[] }} options
 *
 * @returns {CastroPlugin}
 */
export function tailwind({ input }) {
	const inputs = Array.isArray(input) ? input : [input];

	// Single processor instance — @tailwindcss/postcss maintains a module-level
	// LRU cache keyed by input file path with mtime tracking, so it handles
	// staleness and incremental rebuilds internally.
	// @link - https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-postcss/src/index.ts
	const processor = postcss([tailwindcss()]);

	return {
		name: "castro-tailwind",
		watchDirs: [...new Set(inputs.map((file) => dirname(file) || "."))],

		async onPageBuild() {
			for (const file of inputs) {
				const source = await Bun.file(file).text();
				const result = await processor.process(source, { from: file });
				await Bun.write(join("dist", basename(file)), result.css);
			}
		},

		getPageAssets() {
			return inputs.map((file) => ({
				tag: "link",
				attrs: {
					rel: "stylesheet",
					href: `/${basename(file).replaceAll("\\", "/")}`,
				},
			}));
		},
	};
}
