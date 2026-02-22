/**
 * Castro Tailwind Plugin
 *
 * Integrates Tailwind CSS into Castro's build pipeline.
 * Processes CSS files through PostCSS with @tailwindcss/postcss,
 * writes compiled output to dist/, and auto-injects <link> tags.
 *
 * Users only need to install this plugin and daisyui (or other
 * Tailwind plugins) — PostCSS and Tailwind are bundled here.
 */

import { basename, join } from "node:path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

/**
 * @param {{ input: string | string[] }} options
 * @returns {import("@vktrz/castro").CastroPlugin}
 */
export function tailwind({ input }) {
	const inputs = Array.isArray(input) ? input : [input];
	const processor = postcss([tailwindcss()]);

	return {
		name: "castro-tailwind",
		watchPaths: [...inputs],

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
				attrs: { rel: "stylesheet", href: `/${basename(file)}` },
			}));
		},
	};
}
