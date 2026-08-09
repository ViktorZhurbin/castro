/**
 * JSX Compiler
 *
 * Compiles a page or layout's JSX/TSX to JavaScript and imports the module.
 * Also extracts any imported CSS files for injection, and runs the island
 * build plugins so island imports are replaced with marker components.
 */

import { resolve } from "node:path/posix";

import {
  castroExternalsPlugin,
  cssPackagePlugin,
  islandMarkerPlugin,
} from "../islands/buildPlugins.js";
import { safeBunBuild } from "../utils/bunBuild.js";
import { getModule } from "../utils/cache.js";
import { getProjectDependencies } from "../utils/dependencies.js";
import { CastroError } from "../utils/errors.js";

/**
 * @param {string} sourceFilePath - Path to JSX/TSX file
 */
export async function compileJSX(sourceFilePath) {
  // Build configuration
  // Bun.build requires absolute entrypoints when using onResolve plugins
  const absoluteSourcePath = resolve(sourceFilePath);

  const result = await safeBunBuild({
    entrypoints: [absoluteSourcePath],
    target: "bun",
    // See getProjectDependencies() for why every package.json dependency is externalized.
    external: await getProjectDependencies(),
    format: "esm",
    // Pages and layouts compile to Preact VNodes (not HTML strings directly).
    // The renderToString() call in renderPage.js converts the page + layout
    // tree to HTML.
    // This is a build-time convenience — Preact is NOT shipped to the browser
    // for static pages.
    jsx: { runtime: "automatic", importSource: "preact" },
    loader: { ".css": "css" },
    define: {
      // makes sure we use production mode for SSG
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    plugins: [castroExternalsPlugin, cssPackagePlugin, islandMarkerPlugin],
  });

  const jsFile = result.outputs.find((f) => f.path.endsWith(".js"));
  const cssFiles = result.outputs.filter((f) => f.path.endsWith(".css"));

  if (!jsFile) {
    throw new CastroError("BUNDLE_NO_OUTPUT", { sourceFilePath });
  }

  const jsText = await jsFile.text();

  return {
    cssFiles,
    module: await getModule(sourceFilePath, jsText),
  };
}
