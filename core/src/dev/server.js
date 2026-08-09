/**
 * Development Server
 *
 * A simple dev server with:
 * - Static file serving
 * - File watching for auto-rebuild
 * - Live reload via Server-Sent Events (SSE)
 *
 * Live reload works by:
 * 1. Browser connects to /events and holds connection open
 * 2. Server watches files and rebuilds on change
 * 3. Server sends "reload" event through all open connections
 * 4. Browser receives event and reloads the page
 */

import { stat, watch } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path/posix";
import { styleText } from "node:util";

import { buildAll } from "../builder/buildAll.js";
import { CONFIG_FILE, config, configFilePath } from "../config.js";
import { COMPONENTS_DIR, LAYOUTS_DIR, OUTPUT_DIR, PAGES_DIR, PUBLIC_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { toPayload } from "../utils/errors.js";
import { renderErrorToTerminal } from "../utils/renderError.js";

/**
 * @import { FileChangeInfo } from "node:fs/promises";
 */

/**
 * Resolve a request path to a file in the output dir, trying the spellings a
 * static host would. Returns null when nothing matches, leaving 404 handling
 * to the caller.
 *
 * Decoding is what makes `/my%20page` and `/%C3%BCber` reach the files a real
 * host would serve. It is not a security boundary — see "Hostile input" in
 * CLAUDE.md.
 *
 * `outputRoot` is a parameter rather than a module constant so a test can point
 * it at a fixture tree instead of `process.chdir()`-ing the whole process. It is
 * resolved here so a relative path or trailing slash can't defeat the
 * containment check below.
 *
 * @param {string} pathname - raw, still-encoded `url.pathname`
 * @param {string} outputRoot - path to the output dir, absolute or relative
 * @returns {Promise<Bun.BunFile | null>}
 */
export async function resolveStaticFile(pathname, outputRoot) {
  const root = resolve(outputRoot);

  // Leading "." keeps an absolute-looking pathname relative to the root.
  const basePath = resolve(root, `.${decodeURIComponent(pathname)}`);

  /** @type {string[]} */
  const candidates = [];

  if (pathname.endsWith("/")) {
    // Trailing slash (e.g. /blog/) is an explicit directory request.
    candidates.push(join(basePath, "index.html"));
  }

  // Assets (/style.css, /app.js) are served at their exact path.
  // Missing ones fall through to the caller's 404 handling — browsers
  // probe paths like /favicon.ico and /.well-known/… on every site.
  if (extname(pathname)) {
    candidates.push(basePath);
  }

  candidates.push(
    // Clean URL: /about → about.html
    `${basePath}.html`,
    // Clean URL: /blog → blog/index.html
    join(basePath, "index.html"),
  );

  // A trailing-slash request names the same index.html twice; the Set spares it
  // the duplicate stat.
  for (const candidate of new Set(candidates)) {
    // `${basePath}.html` is `dist.html` when the base is the output dir
    // itself — a sibling of it, not a file in it. A plain `/` reaches that.
    if (!candidate.startsWith(`${root}/`)) continue;

    const file = Bun.file(candidate);

    if (await file.exists()) return file;
  }

  return null;
}

// Ignore editor temp files and OS metadata.
// Any file change that doesn't match triggers a rebuild.
const IGNORE = new Bun.Glob("{*~,*.swp,*.swo,*.tmp,.DS_Store,4913}");

/**
 * @param {string} filename
 * @returns {boolean}
 */
export function isIgnored(filename) {
  return IGNORE.match(basename(filename));
}

/**
 * Decide whether a watch event names a file whose contents actually moved,
 * recording the new mtime in `modTimes`.
 *
 * This breaks a self-inflicted feedback loop: every rebuild reads the watched
 * source trees (Bun.build on pages/layouts/components, cp() on public/), and
 * macOS FSEvents surfaces those reads as change events — an unfiltered watcher
 * rebuilds forever after any edit. Linux inotify never reports them, so the
 * loop is invisible there.
 *
 * A failed stat means the file is gone, which is a real change: the caller must
 * still rebuild.
 *
 * `modTimes` is passed in rather than owned here so each watcher keeps its own.
 *
 * @param {Map<string, number>} modTimes - last-seen mtime per path, mutated here
 * @param {string} watchedFilePath
 * @returns {Promise<boolean>}
 */
export async function hasFileChanged(modTimes, watchedFilePath) {
  try {
    const stats = await stat(watchedFilePath);

    if (stats.isDirectory() || modTimes.get(watchedFilePath) === stats.mtimeMs) {
      return false;
    }

    modTimes.set(watchedFilePath, stats.mtimeMs);

    return true;
  } catch {
    modTimes.delete(watchedFilePath);

    return true;
  }
}

/** @type {TextEncoder} */
const encoder = new TextEncoder();

/**
 * Send an SSE message to every connected browser, evicting dead connections.
 *
 * One stale controller must not stop the others from receiving the message: a
 * throw here would abort the loop mid-broadcast, and the callers in
 * `startDevServer` sit inside a try whose catch reports build failures — so it
 * would also surface as a fabricated build error.
 *
 * @param {Set<ReadableStreamDefaultController>} controllers - mutated when a dead connection is dropped
 * @param {string} message
 */
export function broadcast(controllers, message) {
  const data = encoder.encode(message);

  for (const controller of controllers) {
    try {
      controller.enqueue(data);
    } catch {
      controllers.delete(controller);
    }
  }
}

/**
 * Build the request handler: the SSE live-reload endpoint, static files, and an
 * HTML-only 404 fallback.
 *
 * Separate from `startDevServer` so it can be driven with a bare `Request`.
 * Reaching it through the server instead would mean a `buildAll()`, a bound
 * port, process signal handlers, and four watchers that never terminate.
 *
 * @param {object} options
 * @param {Set<ReadableStreamDefaultController>} options.controllers - live SSE connections, added and removed as browsers come and go
 * @param {string} [options.outputRoot] - path to the output dir, absolute or relative
 * @returns {(req: Request) => Promise<Response>}
 */
export function createFetchHandler({ controllers, outputRoot = resolve(OUTPUT_DIR) }) {
  const root = resolve(outputRoot);

  return async function handleRequest(req) {
    const url = new URL(req.url);

    // SSE endpoint for live reload
    if (url.pathname === "/events") {
      /** @type {ReadableStreamDefaultController} */
      let sseController;

      const stream = new ReadableStream({
        start(controller) {
          sseController = controller;
          controllers.add(controller);
        },
        cancel() {
          controllers.delete(sseController);
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const file = await resolveStaticFile(url.pathname, root);

    if (file) {
      return new Response(file);
    }

    // 404 fallback - serve 404.html for HTML requests (navigation, not assets)
    const acceptsHtml = req.headers.get("accept")?.includes("text/html");

    if (acceptsHtml) {
      const notFoundFile = Bun.file(join(root, "404.html"));

      if (await notFoundFile.exists()) {
        // No explicit Content-Type: Bun infers it from the extension, as the
        // static-file response above relies on, and its inference keeps the
        // charset that spelling it out here drops.
        return new Response(notFoundFile, { status: 404 });
      }
    }

    // simple fallback if 404 page doesn't exist
    return new Response("Not Found", { status: 404 });
  };
}

/**
 * Start the development server
 */
export async function startDevServer() {
  // Initial build
  await buildAll();

  // Track SSE controllers for live reload
  /** @type {Set<ReadableStreamDefaultController>} */
  const controllers = new Set();

  // Ctrl+C
  process.on("SIGINT", () => process.exit(0));
  // kill command
  process.on("SIGTERM", () => process.exit(0));

  try {
    Bun.serve({
      port: config.port,
      development: true,
      idleTimeout: 0, // SSE connections must stay open indefinitely
      reusePort: false, // Fail loudly if another process is using this port (only works on Linux, unfortunately)
      fetch: createFetchHandler({ controllers }),
      error(err) {
        console.error(messages.devServer.serverError(err.message));
        return new Response("Internal Server Error", { status: 500 });
      },
    });

    console.info(
      `\n${messages.devServer.ready(styleText("cyan", `http://localhost:${config.port}`))}`,
    );
  } catch (e) {
    const err = /** @type {Bun.ErrorLike} */ (e);

    console.error(messages.devServer.serverError(err.message));

    // Let the process exit naturally after flushing stderr.
    // process.exit(1) would force immediate termination, risking
    // the error message above being truncated.
    process.exitCode = 1;
    return;
  }

  // Debounced rebuild — collapses rapid file events (e.g., git checkout)
  // into a single buildAll(). Serialized so builds never overlap.
  // Only reloads the browser on success; errors are sent as a separate SSE
  // event so the console message isn't lost to an immediate reload.
  const rebuild = debounceRebuilds(async () => {
    try {
      await buildAll();
      broadcast(controllers, "data: reload\n\n");
    } catch (e) {
      const payload = toPayload(e);

      console.error(renderErrorToTerminal(payload));
      broadcast(controllers, `event: build-error\ndata: ${JSON.stringify(payload)}\n\n`);
    }
  }, 80);

  watchDir(PAGES_DIR);
  watchDir(LAYOUTS_DIR);
  watchDir(COMPONENTS_DIR);
  watchDir(PUBLIC_DIR);
  watchConfig();

  /**
   * @param {string} watchedFilePath
   */
  function logFileChanged(watchedFilePath) {
    console.info(styleText("gray", messages.files.changed(watchedFilePath)));
  }

  /**
   * Watch castro.config.ts and tell the user a restart is needed.
   *
   * The config is read once at import, so there is nothing a rebuild could pick
   * up (see the module docblock in `config.js`). This watcher exists purely so
   * an edit says "restart" instead of looking like it took effect.
   *
   * macOS watches by path, so this survives an editor saving by atomic rename
   * and keeps firing after (verified, Bun 1.3.14). Linux inotify watches the
   * inode, where a rename-over may end the watch silently; untested, and worth
   * a missed advisory log at most.
   */
  async function watchConfig() {
    /** @type {AsyncIterable<FileChangeInfo<string>>} */
    let watcher;

    try {
      watcher = watch(configFilePath);
    } catch (e) {
      const err = /** @type {Bun.ErrorLike} */ (e);

      // ENOENT = no config file, which is the common case.
      if (err.code !== "ENOENT") {
        console.warn(messages.devServer.watchError(CONFIG_FILE, err.message));
      }
      return;
    }

    for await (const _event of watcher) {
      console.info(styleText("yellow", messages.devServer.configChanged));
    }
  }

  /**
   * Watch a directory and schedule a rebuild on changes.
   *
   * Only events whose mtime actually moved schedule a rebuild — see
   * `hasFileChanged` for why that filter exists.
   *
   * @param {string} dir
   */
  async function watchDir(dir) {
    /** @type {AsyncIterable<FileChangeInfo<string>>} */
    let watcher;

    try {
      watcher = watch(dir, { recursive: true });
    } catch (e) {
      const err = /** @type {Bun.ErrorLike} */ (e);

      // ENOENT = directory doesn't exist yet.
      if (err.code !== "ENOENT") {
        console.warn(messages.devServer.watchError(dir, err.message));
      }
      return;
    }

    /** @type {Map<string, number>} */
    const modTimes = new Map();

    for await (const event of watcher) {
      if (!event.filename || isIgnored(event.filename)) continue;

      const watchedFilePath = join(dir, event.filename);

      if (!(await hasFileChanged(modTimes, watchedFilePath))) continue;

      logFileChanged(watchedFilePath);
      rebuild.schedule();
    }
  }
}

/**
 * Debounced async runner.
 *
 * Collapses rapid `schedule()` calls into a single execution of `fn`.
 * If `schedule()` is called while `fn` is running, `fn` runs once more
 * after the current pass finishes. Builds never overlap.
 *
 * @param {() => Promise<void>} fn - Async work to run
 * @param {number} ms - Debounce delay in milliseconds
 */
export function debounceRebuilds(fn, ms) {
  /** @type {NodeJS.Timeout | null} */
  let timer = null;

  /**
   * Resolves when the current fn() call finishes. Null when idle.
   * @type {Promise<void> | null}
   */
  let active = null;

  async function flush() {
    timer = null;

    // Wait for any in-progress run, then go again
    if (active) {
      await active;

      return flush();
    }

    active = fn();
    await active;
    active = null;
  }

  return {
    schedule() {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(flush, ms);
    },
  };
}
