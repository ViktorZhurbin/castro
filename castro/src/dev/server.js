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

import { watch } from "node:fs/promises";
import { extname, join } from "node:path";
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
import { allPlugins } from "../islands/plugins.js";
import { messages } from "../messages/index.js";
import { debounceAsync } from "../utils/debounceAsync.js";

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

				/**
				 * Static file serving with clean URLs
				 *
				 * We resolve paths to support Clean URLs:
				 *	- /about      -> dist/about.html
				 *	- /blog       -> dist/blog/index.html
				 *	- /style.css  -> dist/style.css
				 */

				const basePath = join(OUTPUT_DIR, url.pathname);

				/** @type {string[]} */
				let candidates = [];

				if (url.pathname.endsWith("/")) {
					// Trailing slash (e.g. /blog/) implies an explicit directory request.
					// We strictly only look for the index file.
					candidates = [join(basePath, "index.html")];
				} else {
					// Clean URL Strategy:
					// 1. Exact match: Priorities assets (.css, .js) and files with extensions.
					// 2. HTML suffix: Handles /about -> about.html.
					// 3. Index fallback: Handles /blog -> blog/index.html (if user omitted slash).
					candidates = [
						basePath,
						`${basePath}.html`,
						join(basePath, "index.html"),
					];
				}

				// Check candidates in order and serve the first one that exists
				for (const path of candidates) {
					const file = Bun.file(path);

					if (await file.exists()) {
						return new Response(file);
					}
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

	// TODO: ignore those temp files instead?
	// Extensions that trigger rebuilds — ignores editor temp files (.tmp, .swp, ~)
	const PAGE_EXTENSIONS = new Set([".md", ".jsx", ".tsx", ".css"]);
	const SOURCE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);

	// Debounced rebuild — collapses rapid file events (e.g., git checkout)
	// into a single buildAll(). Serialized so builds never overlap.
	const rebuild = debounceAsync(
		async () => {
			try {
				await buildAll();
			} catch (e) {
				const err = /** @type {Bun.ErrorLike} */ (e);
				console.error(styleText("red", err.message));
			}
		},
		80,
		{ onComplete: notifyReload },
	);

	// Watch pages directory
	(async () => {
		const watcher = watch(PAGES_DIR, { recursive: true });

		for await (const event of watcher) {
			if (!event.filename) continue;
			if (!PAGE_EXTENSIONS.has(extname(event.filename))) continue;

			logFileChanged(join(PAGES_DIR, event.filename));
			rebuild.schedule();
		}
	})();

	for (const dir of [LAYOUTS_DIR, COMPONENTS_DIR, PUBLIC_DIR]) {
		(async () => {
			/** @type {AsyncIterable<FileChangeInfo<string>>} */
			let watcher;

			try {
				watcher = watch(dir, { recursive: true });
			} catch (e) {
				const err = /** @type {Bun.ErrorLike} */ (e);

				// ENOENT = directory doesn't exist yet, which is fine
				if (err.code !== "ENOENT") {
					console.warn(messages.devServer.watchError(dir, err.message));
				}
				return;
			}

			for await (const event of watcher) {
				if (!event.filename) continue;
				if (!SOURCE_EXTENSIONS.has(extname(event.filename))) continue;

				logFileChanged(`${dir}/${event.filename}`);
				rebuild.schedule();
			}
		})();
	}

	// Watch directories declared by user plugins.
	// Changes trigger the plugin's onPageBuild() and a browser reload.
	for (const plugin of allPlugins) {
		if (!plugin.watchDirs?.length) continue;

		for (const dir of plugin.watchDirs) {
			(async () => {
				/** @type {AsyncIterable<FileChangeInfo<string>>} */
				let watcher;

				try {
					watcher = watch(dir);
				} catch {
					return;
				}

				for await (const event of watcher) {
					if (!event.filename) continue;
					if (!SOURCE_EXTENSIONS.has(extname(event.filename))) continue;

					logFileChanged(join(dir, event.filename));
					rebuild.schedule();
				}
			})();
		}
	}

	function logFileChanged(/** @type {string} */ filePath) {
		console.info(styleText("gray", messages.files.changed(filePath)));
	}

	/** @type {TextEncoder} */
	const encoder = new TextEncoder();

	function notifyReload() {
		const data = encoder.encode("data: reload\n\n");
		for (const controller of controllers) {
			try {
				controller.enqueue(data);
			} catch {
				controllers.delete(controller);
			}
		}
	}
}
