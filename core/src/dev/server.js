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
import { extname, join } from "node:path/posix";
import { styleText } from "node:util";
import { buildAll } from "../builder/buildAll.js";
import { config } from "../config.js";
import {
	COMPONENTS_DIR,
	LAYOUTS_DIR,
	OUTPUT_DIR,
	PAGES_DIR,
	PUBLIC_DIR,
} from "../constants.js";
import { messages } from "../messages/index.js";
import { toPayload } from "../utils/errors.js";
import { renderErrorToTerminal } from "../utils/renderError.js";

/**
 * @import { FileChangeInfo } from "node:fs/promises";
 */

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
			async fetch(req) {
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

				// Static file serving with clean URLs
				// Real SSGs handle more variations; see NON-GOALS.md.

				const basePath = join(OUTPUT_DIR, url.pathname);

				if (url.pathname.endsWith("/")) {
					// Trailing slash (e.g. /blog/) is an explicit directory request.
					return new Response(Bun.file(join(basePath, "index.html")));
				}

				// Assets (/style.css, /app.js) are served at their exact path.
				if (extname(url.pathname)) {
					return new Response(Bun.file(basePath));
				}

				// Clean URL: /about → about.html
				const htmlFile = Bun.file(`${basePath}.html`);
				if (await htmlFile.exists()) {
					return new Response(htmlFile);
				}

				// Clean URL: /blog → blog/index.html
				const indexFile = Bun.file(join(basePath, "index.html"));
				if (await indexFile.exists()) {
					return new Response(indexFile);
				}

				// 404 fallback - serve 404.html for HTML requests (navigation, not assets)
				const acceptsHtml = req.headers.get("accept")?.includes("text/html");

				if (acceptsHtml) {
					const notFoundFile = Bun.file(join(OUTPUT_DIR, "404.html"));

					if (await notFoundFile.exists()) {
						return new Response(notFoundFile, {
							status: 404,
							headers: { "Content-Type": "text/html" },
						});
					}
				}

				// simple fallback if 404 page doesn't exist
				return new Response("Not Found", { status: 404 });
			},
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
			broadcast("data: reload\n\n");
		} catch (e) {
			const payload = toPayload(e);

			console.error(renderErrorToTerminal(payload));
			broadcast(`event: build-error\ndata: ${JSON.stringify(payload)}\n\n`);
		}
	}, 80);

	watchDir(PAGES_DIR);
	watchDir(LAYOUTS_DIR);
	watchDir(COMPONENTS_DIR);
	watchDir(PUBLIC_DIR);

	function logFileChanged(/** @type {string} */ filePath) {
		console.info(styleText("gray", messages.files.changed(filePath)));
	}

	/** @type {TextEncoder} */
	const encoder = new TextEncoder();

	/**
	 * Send an SSE message to every connected browser, evicting dead connections.
	 * @param {string} message
	 */
	function broadcast(message) {
		const data = encoder.encode(message);
		for (const controller of controllers) {
			try {
				controller.enqueue(data);
			} catch {
				controllers.delete(controller);
			}
		}
	}

	// Ignore editor temp files and OS metadata.
	// Any file change that doesn't match triggers a rebuild.
	const IGNORE = new Bun.Glob("{*~,*.swp,*.swo,*.tmp,.DS_Store,4913}");
	/**
	 * @param {string | undefined} filename
	 * @returns {boolean}
	 */
	function isIgnored(filename) {
		return !filename || IGNORE.match(filename.split("/").pop() ?? "");
	}

	/**
	 * Watch a directory and schedule a rebuild on changes.
	 *
	 * The mtime filter exists because cp() (and some editors/indexers) trigger
	 * watcher events for atime/metadata reads that don't actually modify the
	 * file. Without it, those no-op events feed back into the build output and
	 * trip a rebuild loop.
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

		for await (const event of watcher) {
			if (!event.filename || isIgnored(event.filename)) continue;

			const filePath = join(dir, event.filename);

			logFileChanged(filePath);
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
function debounceRebuilds(fn, ms) {
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
