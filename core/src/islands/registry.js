/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files and hands each to
 * compileIsland(), which returns it fully loaded — SSR module included, so
 * renderMarker() can reach it synchronously during renderToString().
 */

import { access } from "node:fs/promises";
import { dirname, join } from "node:path/posix";

import { COMPONENTS_DIR, ISLANDS_OUTPUT_DIR, OUTPUT_DIR } from "../constants.js";
import { compileIsland } from "./compiler.js";
import { getIslandId } from "./islandId.js";

/**
 * @import { IslandComponent } from '../types.d.ts'
 *
 * @typedef {ReturnType<typeof getIslandId>} IslandId
 */

class IslandsRegistry {
  /** @type {Map<IslandId, IslandComponent>} */
  #islands = new Map();

  /** @param {IslandId} id */
  getIsland(id) {
    return this.#islands.get(id);
  }

  /**
   * Discover, compile, and load all islands from disk.
   */
  async load() {
    this.#islands.clear();

    // Islands are optional — a project with no components/ dir is valid.
    try {
      await access(COMPONENTS_DIR);
    } catch (e) {
      const err = /** @type {Bun.ErrorLike} */ (e);

      if (err.code === "ENOENT") return;

      throw err;
    }

    const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");
    const relativeSourcePaths = await Array.fromAsync(islandGlob.scan(COMPONENTS_DIR));

    // outputDir is derived per-directory, so two islands in one folder share
    // one — safe to compile in parallel anyway, because compileIsland names
    // its artifacts per component and getModule() writes content-hashed
    // paths. Nothing here reads another island's output.
    const compiled = await Promise.all(
      relativeSourcePaths.map((relativeSourcePath) => {
        const relativeDir = dirname(relativeSourcePath);
        const outputDir = join(OUTPUT_DIR, ISLANDS_OUTPUT_DIR, relativeDir);
        const publicDir = join("/", ISLANDS_OUTPUT_DIR, relativeDir);
        const sourceFilePath = join(COMPONENTS_DIR, relativeSourcePath);

        return compileIsland({
          outputDir,
          publicDir,
          sourceFilePath,
        });
      }),
    );

    for (const component of compiled) {
      this.#islands.set(getIslandId(component.sourceFilePath), component);
    }
  }
}

export const islands = new IslandsRegistry();
