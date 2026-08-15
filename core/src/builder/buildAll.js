/**
 * Build Orchestrator
 *
 * Coordinates the full site build:
 * 1. Wipe and recreate output dir
 * 2. Copy public dir to output dir
 * 3. Compile and load islands and layouts
 * 4. Scan pages, detect route conflicts, build each page
 * 5. If any page rendered an island: copy the hydration runtime and vendor
 *    Preact's client dependencies
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path/posix";
import { styleText } from "node:util";

import {
  ISLAND_RUNTIME_FILE,
  OUTPUT_DIR,
  PAGE_EXT_PATTERN,
  PAGES_DIR,
  PUBLIC_DIR,
} from "../constants.js";
import { runWithPageState } from "../islands/pageState.js";
import { islands } from "../islands/registry.js";
import { layouts } from "../layouts.js";
import { messages } from "../messages/index.js";
import { CastroError } from "../utils/errors.js";
import { buildPage } from "./buildPage.js";
import { vendorClientDeps } from "./vendor.js";

export async function buildAll() {
  const isProd = process.env.NODE_ENV === "production";

  console.info(messages.build.starting);

  // Fresh build: wipe and recreate output dir.
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Copy static assets from public → output dir
  try {
    await cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
  } catch (e) {
    const err = /** @type {Bun.ErrorLike} */ (e);

    // ENOENT means PUBLIC_DIR doesn't exist, which is fine
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  await islands.load();
  await layouts.load();
  const pagesMap = await scanPages();

  // Real SSGs would cap concurrency to bound Bun.build's memory pressure
  const results = await Promise.all(
    [...pagesMap.entries()].map(async ([relativeOutputPath, relativeSourcePath]) => {
      const sourceFilePath = join(PAGES_DIR, relativeSourcePath);
      const outputFilePath = join(OUTPUT_DIR, relativeOutputPath);

      const { usedIslands } = await runWithPageState(sourceFilePath, () =>
        buildPage(sourceFilePath, outputFilePath),
      );

      // Log on completion so lines appear in the order pages actually finish
      if (isProd) {
        console.info(
          messages.build.writingFile(
            styleText("cyan", relativeSourcePath),
            styleText("gray", relativeOutputPath),
          ),
        );
      }

      return { hasIslands: usedIslands.size > 0 };
    }),
  );

  // Island output is conditional: a site that rendered no islands ships
  // neither the hydration runtime nor any vendored Preact code.
  if (results.some((result) => result.hasIslands)) {
    await copyIslandRuntime();
    await vendorClientDeps();
  }

  console.info(messages.build.success(pagesMap.size));
}

/**
 * Copy the <castro-island> custom-element runtime to dist/. This is the one
 * shared script tag every island page loads; it upgrades the SSR markers by
 * importing each island's per-page bundle and mounting it. (The per-island
 * mount function comes from islands/preact.client.js, inlined at compile time.)
 */
async function copyIslandRuntime() {
  await Bun.write(
    join(OUTPUT_DIR, ISLAND_RUNTIME_FILE),
    Bun.file(join(import.meta.dir, "../islands/castroIsland.js")),
  );
}

/**
 * Glob all pages, skip private paths, detect route conflicts.
 * @returns {Promise<Map<string, string>>} relativeOutputPath → relativeSourcePath
 */
async function scanPages() {
  /** @type {Map<string, string>} */
  const pagesMap = new Map();

  /** @type {Map<string, string>} route → relativeSourcePath */
  const routes = new Map();
  const pageGlob = new Bun.Glob("**/*.{md,jsx,tsx}");

  // Missing pages/ throws here naturally
  // Empty pages/ falls through to NO_PAGES below.
  for await (const relativeSourcePath of pageGlob.scan(PAGES_DIR)) {
    // Skip files/folders prefixed with `_` (private convention, e.g. _drafts/, _partial.tsx)
    if (relativeSourcePath.split("/").some((segment) => segment.startsWith("_"))) {
      continue;
    }

    const relativeOutputPath = relativeSourcePath.replace(PAGE_EXT_PATTERN, ".html");
    const route = toRoute(relativeOutputPath);

    // Keyed on the route, not the output file: two pages can write different
    // files and still answer one URL, and which one a visitor gets is then up
    // to the host. Building both and letting the deploy target pick is worse
    // than refusing to build.
    const claimedBy = routes.get(route);
    if (claimedBy) {
      // Bun.Glob.scan() order reflects filesystem directory order, not
      // scan order between runs/machines — sort so the message is stable.
      const [file1, file2] = [claimedBy, relativeSourcePath].toSorted();
      throw new CastroError("ROUTE_CONFLICT", {
        route,
        file1: join(PAGES_DIR, file1),
        file2: join(PAGES_DIR, file2),
      });
    }

    routes.set(route, relativeSourcePath);
    pagesMap.set(relativeOutputPath, relativeSourcePath);
  }

  // pages/ present but empty — distinct from missing, which throws above
  if (pagesMap.size === 0) {
    throw new CastroError("NO_PAGES", { dir: PAGES_DIR });
  }

  return pagesMap;
}

/**
 * The URL an output file answers, collapsing the two spellings of a directory
 * index: `index.html` → `/`, `blog/index.html` and `blog.html` → `/blog`.
 *
 * @param {string} relativeOutputPath
 * @returns {string}
 */
export function toRoute(relativeOutputPath) {
  const withoutExt = relativeOutputPath.slice(0, -".html".length);

  return `/${withoutExt.replace(/(^|\/)index$/, "")}`;
}
