/**
 * Satirical preset - Communist-themed messages
 * One joke maximum per error, prioritizes clarity
 *
 * @type {import('./messages.d.ts').Messages}
 */
export const satirical = {
	// CLI startup
	devServer: {
		ready: (url) =>
			`The revolution is live at ${url}\n` +
			`The State is watching for changes...`,
		serverError: (msg) =>
			`The State apparatus has encountered difficulties: ${msg}`,
		watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`,
	},

	build: {
		starting: "Realizing the Five-Year Plan...",
		success: (count) => `✓ Delivered ${count} pages to the people.`,
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	// The Ministry of Errors (Exceptions)
	errors: {
		ROUTE_CONFLICT: ({ route1, route2, outputPath }) => ({
			title: "Route conflict",
			message: `Two pages claim the same route - ${outputPath}`,
			notes: [route1, route2],
			hint: "The revolution cannot serve two masters — remove the impostor",
		}),

		LAYOUT_NOT_FOUND: ({ layoutId, sourceFilePath }) => ({
			title: "Layout not found",
			message: `Layout '${layoutId}' cannot be located — possible defection`,
			hint: `Create the missing layout, or change layout for ${sourceFilePath}`,
		}),

		LAYOUT_MISSING_DEFAULT: () => ({
			title: "Missing default layout",
			message: "default.jsx not found in layouts/",
			hint: "Create layouts/default.jsx to continue",
		}),

		NO_LAYOUTS_DIR: () => ({
			title: "Layouts directory missing",
			message: `No layouts/ directory found`,
			hint: "Create the directory with at least default.jsx",
		}),

		NO_LAYOUT_FILES: ({ dir }) => ({
			title: "Layouts directory is empty",
			message: `No layout files found in ${dir}`,
			hint: "Create at least default.jsx",
		}),

		LAYOUT_NO_DEFAULT_EXPORT: ({ file }) => ({
			title: "Layout has no default export",
			message: `${file} must export a default function`,
			hint: "Add a default export to this layout",
		}),

		PAGE_NO_DEFAULT_EXPORT: ({ file }) => ({
			title: "Page has no default export",
			message: `${file} must export a default function`,
			hint: "Add a default export to this page",
		}),

		YAML_PARSE_FAILED: ({ errorMessage, sourceFilePath }) => ({
			title: "Invalid Markdown frontmatter",
			message: `Frontmatter parsing in ${sourceFilePath} failed:`,
			errorMessage,
			hint: "Check the frontmatter block at the top of the file",
		}),

		BUNDLE_FAILED: (tokens) => ({
			title: "Sabotage detected",
			message: "Error during JavaScript compilation:",
			errorMessage: tokens?.errorMessage,
			hint: "Check the code frame and error location above",
		}),

		ISLAND_NOT_FOUND: ({ islandId }) => ({
			title: "Island defected",
			message: `Island '${islandId}' failed to load`,
			hint: "This is a Castro internal error — please report it",
		}),

		NO_PAGES: ({ dir }) => ({
			title: "No pages found",
			message: `The revolution requires at least one page in ${dir}`,
			hint: "Create a .md or .jsx/.tsx file in pages/ to continue",
		}),

		META_INVALID: ({ file, issues }) => ({
			title: "Invalid page meta",
			message: `${file} has incomplete papers`,
			notes: issues,
			hint: "Check that all meta properties are properly formed",
		}),

		FRAMEWORK_CONFIG_INVALID: ({ pluginName, missing }) => ({
			title: "Invalid framework config",
			message: `Plugin "${pluginName}" has incomplete papers — missing: ${missing}`,
			hint: "Fill in the missing fields to pass inspection",
		}),

		CACHE_WRITE_FAILED: ({ path, errorMessage }) => ({
			title: "Cache write failed",
			message: `Compiled output at ${path} could not be requisitioned:`,
			errorMessage,
			hint: "Check disk space and write permissions",
		}),

		ISLAND_RENDER_FAILED: ({ islandId, errorMessage }) => ({
			title: "Island SSR failed",
			message: `Island ${islandId} failed to fulfill its server-side obligations:`,
			errorMessage,
			hint: "Check for browser-only APIs like 'window' or 'document'. Move them inside useEffect or a lifecycle hook.",
		}),

		FRAMEWORK_LOAD_FAILED: ({ name, errorMessage }) => ({
			title: "Framework failed to load",
			message: `Plugin "${name}" failed to report for duty:`,
			errorMessage,
			hint: "Check the plugin's frameworkConfig for initialization errors",
		}),

		CONFIG_LOAD_FAILED: ({ path, errorMessage }) => ({
			title: "Config file failed to load",
			message: `${path} threw an error during evaluation:`,
			errorMessage,
			hint: "Fix the syntax or runtime error in your config file — the Plan cannot proceed otherwise",
		}),

		UNEXPECTED: () => ({
			title: "Unexpected error",
			message: "The revolution has encountered an anomaly",
			hint: "Check the error details above",
		}),
	},
};
