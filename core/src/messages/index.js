/**
 * Castro speaks in one voice.
 *
 * Every user-facing string lives here: CLI output, dev-server logs, and the
 * error table that the terminal and browser-overlay renderers consume. The
 * error factories are keyed by ErrorCode and return renderer-ready ErrorContent,
 * so structure (the payload shape in types.d.ts) stays decoupled from this voice.
 *
 * One joke maximum per error, clarity first. See README.md for tone rules.
 */

/** @import { ErrorMessages } from "../types.d.ts" */

export const messages = {
  // CLI startup
  devServer: {
    /** @param {string} url */
    ready: (url) => `The revolution is live at ${url}\n` + `The State is watching for changes...`,
    /** @param {string} msg */
    serverError: (msg) => `The State apparatus has encountered difficulties: ${msg}`,
    /** @param {string} dir @param {string} msg */
    watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`,
    configChanged: "Config revised — the Plan is fixed until the server restarts.",
  },

  build: {
    starting: "Realizing the Five-Year Plan...",
    /** @param {number} count */
    success: (count) => `✓ Delivered ${count} page${count === 1 ? "" : "s"} to the people.`,
    /** @param {string} source @param {string} dest */
    writingFile: (source, dest) => `Writing ${source} → ${dest}`,
  },

  // File operations
  files: {
    /** @param {string} sourceFilePath */
    changed: (sourceFilePath) => `Revised: ${sourceFilePath}`,
  },

  // Commands
  commands: {
    /** @param {string} cmd */
    unknown: (cmd) => `❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
    usage: "Usage: castro [dev|build]",
  },

  // The Ministry of Errors (Exceptions)
  errors: /** @satisfies {ErrorMessages} */ ({
    ROUTE_CONFLICT: ({ route, file1, file2 }) => ({
      title: "Route conflict",
      message: `Two pages claim the same route - ${route}`,
      notes: [file1, file2],
      hint: "The revolution cannot serve two masters — remove the impostor",
    }),

    LAYOUT_NOT_FOUND: ({ layoutId, sourceFilePath }) => ({
      title: "Layout not found",
      message: `Layout '${layoutId}' cannot be located — possible defection`,
      hint: `Create the missing layout, or change layout for ${sourceFilePath}`,
    }),

    NO_DEFAULT_LAYOUT: ({ dir }) => ({
      title: "No default layout",
      message: `${dir}/default.{jsx,tsx} not found — every page renders through a layout`,
      hint: `Create default.jsx or default.tsx in ${dir}/ to continue`,
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

    BUNDLE_FAILED: () => ({
      title: "Sabotage detected",
      message: "Error during JavaScript compilation:",
      hint: "Check the code frame and error location above",
    }),

    BUNDLE_NO_OUTPUT: ({ sourceFilePath }) => ({
      title: "Production quota unmet",
      message: `${sourceFilePath} compiled without producing any JavaScript`,
      hint: "This is a Castro internal error — please report it",
    }),

    ISLAND_NOT_FOUND: ({ islandId, sourceFilePath }) => ({
      title: "Island defected",
      message: `${sourceFilePath} renders island ${islandId}, which failed to load`,
      hint: "This is a Castro internal error — please report it",
    }),

    NO_PAGES: ({ dir }) => ({
      title: "No pages found",
      message: `The revolution requires at least one page in ${dir}/`,
      hint: "Create a .md or .jsx/.tsx file in pages/ to continue",
    }),

    ISLAND_RENDER_FAILED: ({ islandId, sourceFilePath, errorMessage }) => ({
      title: "Island SSR failed",
      message: `${sourceFilePath} renders island ${islandId}, which failed to fulfill its server-side obligations:`,
      errorMessage,
      hint: "Check for browser-only APIs like 'window' or 'document'. Move them inside useEffect or a lifecycle hook.",
    }),

    ISLAND_HAS_CHILDREN: ({ islandId, sourceFilePath }) => ({
      title: "Island received children",
      message: `${sourceFilePath} nests children inside island ${islandId}, but only props cross the border into the browser`,
      hint: "Pass the content as a prop, or keep the wrapper outside the island",
    }),

    ISLAND_MULTIPLE_DIRECTIVES: ({ islandId, sourceFilePath, directives }) => ({
      title: "Island has competing directives",
      message: `${sourceFilePath} gives island ${islandId} more than one hydration directive`,
      notes: directives,
      hint: "An island hydrates one way — keep the directive you meant",
    }),

    ISLAND_PROPS_NOT_SERIALIZABLE: ({ islandId, sourceFilePath, errorMessage }) => ({
      title: "Island props rejected",
      message: `${sourceFilePath} passes props to island ${islandId} that could not be serialized for the browser:`,
      errorMessage,
      hint: "Props travel to the browser as JSON — no functions, class instances, or elements",
    }),

    CONFIG_LOAD_FAILED: ({ configFile, errorMessage }) => ({
      title: "Config file failed to load",
      message: `${configFile} threw an error during evaluation:`,
      errorMessage,
      hint: "Fix the syntax or runtime error in your config file — the Plan cannot proceed otherwise",
    }),

    UNEXPECTED: () => ({
      title: "Unexpected error",
      message: "The revolution has encountered an anomaly",
      hint: "Check the error details above",
    }),
  }),
};
