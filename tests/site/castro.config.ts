import { defineConfig } from "@vktrz/castro";

export default defineConfig({
	markdown: {
		options: { headings: true, tables: true, tasklists: true },
	},
	// Vendored alongside Preact's deps — verify.test.js asserts the import map
	// entry, the vendor bundle, and that island bundles don't inline it.
	clientDependencies: ["@preact/signals"],
});
