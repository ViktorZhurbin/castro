/**
 * Serious preset - Straightforward technical messages
 * No satire, just clear information
 *
 * @type {import('./messages.d.ts').Messages}
 */
export const serious = {
	// CLI startup
	devServer: {
		ready: (url) =>
			`Dev server running at ${url}\nWatching for file changes...`,
		serverError: (msg) => `Server error: ${msg}`,
		watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`,
	},

	build: {
		starting: "Building site...",
		success: (count) => `✓ Build complete: ${count} pages.`,
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
	},

	// File operations
	files: {
		changed: (path) => `Changed: ${path}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown command: ${cmd}\n   Available commands: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	// Exceptions
	errors: {
		ROUTE_CONFLICT: ({ route1, route2, outputPath }) => ({
			title: "Route conflict",
			message: `Two pages map to the same route - ${outputPath}`,
			notes: [route1, route2],
			hint: "Remove or rename one of these files",
		}),

		LAYOUT_NOT_FOUND: ({ layoutId, sourceFilePath }) => ({
			title: "Layout not found",
			message: `Layout '${layoutId}' does not exist in layouts/`,
			hint: `Create the layout, or change the layout for ${sourceFilePath}`,
		}),

		LAYOUT_MISSING_DEFAULT: () => ({
			title: "Missing default layout",
			message: "layouts/default.jsx is required",
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
			title: "Markdown frontmatter syntax error",
			message: `Frontmatter parsing in ${sourceFilePath} failed:`,
			errorMessage,
			hint: "Check the frontmatter block at the top of the file",
		}),

		META_INVALID: ({ file, issues }) => ({
			title: "Invalid page meta",
			message: `${file} has invalid meta properties`,
			notes: issues,
			hint: "Check that all meta properties have correct types",
		}),

		BUNDLE_FAILED: (tokens) => ({
			title: "Build failed",
			message: "Error during JavaScript compilation:",
			errorMessage: tokens?.errorMessage,
			hint: "Check the code frame and error location above",
		}),

		ISLAND_NOT_FOUND: ({ islandId }) => ({
			title: "Island not found",
			message: `Island '${islandId}' failed to load`,
			hint: "This is a Castro internal error — please report it",
		}),

		NO_PAGES: ({ dir }) => ({
			title: "No pages found",
			message: `No .md or .jsx/.tsx files found in ${dir}`,
			hint: "Create at least one page file to continue",
		}),

		FRAMEWORK_CONFIG_INVALID: ({ pluginName, missing }) => ({
			title: "Invalid framework config",
			message: `Plugin "${pluginName}" frameworkConfig is missing required fields: ${missing}`,
			hint: "Add the missing fields to the frameworkConfig",
		}),

		FRAMEWORK_CONFIG_NO_DETECTION: ({ pluginName }) => ({
			title: "Framework config missing detection",
			message: `Plugin "${pluginName}" frameworkConfig has no detection arrays`,
			hint: "Declare detectImports",
		}),

		CACHE_WRITE_FAILED: ({ path, errorMessage }) => ({
			title: "Cache write failed",
			message: `Could not write compiled output to ${path}:`,
			errorMessage,
			hint: "Check disk space and write permissions",
		}),

		ISLAND_RENDER_FAILED: ({ islandId, errorMessage }) => ({
			title: "Island SSR failed",
			message: `Island ${islandId} failed to render server-side:`,
			errorMessage,
			hint: "Check for browser-only APIs like 'window' or 'document'. Move them inside useEffect or a lifecycle hook.",
		}),

		FRAMEWORK_LOAD_FAILED: ({ name, errorMessage }) => ({
			title: "Framework failed to load",
			message: `Plugin "${name}" threw during framework registration:`,
			errorMessage,
			hint: "Check the plugin's frameworkConfig for initialization errors",
		}),

		CONFIG_LOAD_FAILED: ({ path, errorMessage }) => ({
			title: "Config file failed to load",
			message: `${path} threw an error during evaluation:`,
			errorMessage,
			hint: "Fix the syntax or runtime error in your config file",
		}),

		UNEXPECTED: () => ({
			title: "Unexpected error",
			message: "An error occurred during the build",
			hint: "Check the error details above",
		}),
	},
};
