/**
 * Development Server
 *
 * A simple dev server with:
 * - Static file serving
 * - File watching for auto-rebuild
 * - Live reload via Server-Sent Events
 *
 * Educational note: This is a minimal implementation showing
 * how dev servers work. Production servers like Vite do more,
 * but the core concepts are the same.
 */

import { watch } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import { buildAll } from "../build/builder.js";
import { buildJSXPage } from "../build/page-jsx.js";
import { buildMarkdownPage } from "../build/page-markdown.js";
import { CONFIG_FILE, LAYOUTS_DIR, OUTPUT_DIR, PAGES_DIR } from "../config.js";
import { layouts } from "../layouts/registry.js";
import { LiveReloadEvents } from "./live-reload-events.js";

const PORT = 3000;

/**
 * Start the development server
 */
export async function startDevServer() {
	process.env.NODE_ENV = "development";

	// Initial build
	await buildAll();

	console.info("Watching...");
	console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

	// Track SSE connections for live reload
	const connections = new Set();

	const server = polka()
		// SSE endpoint for live reload
		.get("/events", (req, res) => {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			});
			connections.add(res);
			req.on("close", () => connections.delete(res));
		})
		// Serve static files from dist
		.use(sirv(OUTPUT_DIR, { dev: true }))
		.listen(PORT);

	server.server?.on("error", (err) => {
		console.error("Server error:", err.message);
		process.exit(1);
	});

	// Watch config file - restart on change
	(async () => {
		try {
			const watcher = watch(CONFIG_FILE);
			for await (const _event of watcher) {
				console.info(styleText("yellow", "\n⚙️  Config changed, restarting..."));
				server.server?.close();
				process.exit(0);
			}
		} catch {
			// Config file doesn't exist, that's fine
		}
	})();

	// Watch pages directory
	(async () => {
		const watcher = watch(PAGES_DIR, { recursive: true });

		for await (const event of watcher) {
			if (event.filename) {
				const filePath = join(PAGES_DIR, event.filename);
				logFileChanged(filePath);
			}

			// Rebuild specific file type
			if (event.filename?.endsWith(".md")) {
				await buildMarkdownPage(event.filename, { logOnSuccess: true });
			} else if (event.filename?.match(/\.[jt]sx$/)) {
				await buildJSXPage(event.filename, { logOnSuccess: true });
			} else if (event.filename?.endsWith("castro.js")) {
				// Full rebuild when castro.js changes
				await buildAll({ verbose: true });
			}

			notifyReload();
		}
	})();

	// Watch layouts directory
	const watchDirs = [LAYOUTS_DIR];

	for (const dir of watchDirs) {
		(async () => {
			try {
				const watcher = watch(dir, { recursive: true });
				for await (const event of watcher) {
					if (event.filename) {
						logFileChanged(`${dir}/${event.filename}`);

						if (dir === LAYOUTS_DIR) {
							await layouts.load();
						}

						await buildAll();
						notifyReload();
					}
				}
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				if (err.code !== "ENOENT") {
					console.warn(`Could not watch ${dir}:`, err.message);
				}
			}
		})();
	}

	function logFileChanged(/** @type {string} */ filePath) {
		console.info(`${styleText("gray", "File changed:")} ${filePath}`);
	}

	function notifyReload() {
		for (const res of connections) {
			try {
				res.write(`data: ${LiveReloadEvents.Reload}\n\n`);
			} catch {
				connections.delete(res);
			}
		}
	}
}
