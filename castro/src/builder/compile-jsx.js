import { basename, extname } from "node:path";
import { styleText } from "node:util";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";

/**
 * Bun.build plugin to tag island components with their source path ID.
 *
 * Intercepts island file loading and appends `.islandId` to the default export.
 *
 * We read the island source, find the default export name, and
 * append `Name.islandId = "..."` directly to the source code.
 *
 * @type {Bun.BunPlugin}
 */
const islandTaggingPlugin = {
	name: "island-tagging",
	setup(build) {
		build.onLoad({ filter: /\.island\.[jt]sx$/ }, async (args) => {
			const source = await Bun.file(args.path).text();
			const islandId = getIslandId(args.path);

			/**
			 * Regex to extract the identifier name from a default export.
			 * Handles identifiers, functions, async functions, and classes.
			 *
			 * export\s+default\s+          - "export default" followed by whitespace.
			 * (?:                          - Start of non-capturing group for optional keywords.
			 * (?:async\s+)?                	- Optional "async" keyword.
			 * function\s+                  - "function" keyword + whitespace.
			 * |                            - OR
			 * class\s+                     - "class" keyword + whitespace.
			 * )?                            	- Group is optional (handles "export default Name").
			 * (?<componentName>\w+)          - Named group "name": the actual identifier.
			 */
			const regex =
				/export\s+default\s+(?:(?:async\s+)?function\s+|class\s+)?(?<componentName>\w+)/;

			const match = source.match(regex);
			const componentName = match?.groups?.componentName;

			if (!componentName) {
				console.warn(
					styleText(
						"yellow",
						messages.errors.islandAnonymousExport(basename(args.path)),
					),
				);
				// Returning undefined lets Bun load the file as-is (no hydration)
				return undefined;
			}

			const loader = extname(args.path) === ".tsx" ? "tsx" : "jsx";

			return {
				// Append semicolon to be safe against ASI issues
				contents: `${source};\n${componentName}.islandId = "${islandId}";`,
				loader,
			};
		});
	},
};

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for injection.
 * Uses the island-tagging plugin to inject component IDs.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 */
export async function compileJSX(sourcePath) {
	// Build configuration (Bun SSR at build time)
	const result = await Bun.build({
		entrypoints: [sourcePath],
		target: "bun", // Bun target (this code runs at build time, not in browser)
		packages: "external", // Don't bundle node_modules (keep as imports for Bun)
		format: "esm", // Output ES modules
		jsx: { runtime: "automatic", importSource: "preact" },
		loader: {
			".css": "css", // Extract CSS into separate files for injection
		},
		define: {
			// makes sure we use production mode for SSG
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		plugins: [islandTaggingPlugin], // Inject island IDs during import
	});

	if (!result.success) {
		const errors = result.logs.map((log) => log.message).join("\n");
		throw new Error(`Bundle failed for ${sourcePath}:\n${errors}`);
	}

	const jsFile = result.outputs.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputs.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new Error(messages.build.noJsOutput(sourcePath));
	}

	const jsText = await jsFile.text();

	return {
		module: await getModule(sourcePath, jsText),
		cssFiles, // For file writing
	};
}
