/**
 * Castro CLI — Entry point for the `castro` command.
 *
 * Usage:
 * - castro (or castro dev) → development server
 * - castro build → production build
 */

import { messages } from "./messages/index.js";
import { cleanupCacheDir } from "./utils/cache.js";
import { toPayload } from "./utils/errors.js";
import { renderErrorToTerminal } from "./utils/renderError.js";

cleanupCacheDir();

const command = process.argv[2] || "dev";

try {
	switch (command) {
		case "dev": {
			const { startDevServer } = await import("./dev/server.js");
			await startDevServer();
			break;
		}

		// biome-ignore lint/suspicious/noFallthroughSwitchClause: process.exit() would do the job
		case "build": {
			process.env.NODE_ENV = "production";
			const { buildAll } = await import("./builder/buildAll.js");
			await buildAll();

			// Explicit exit — plugins can keep file watchers alive
			// which prevents natural process termination.
			process.exit(0);
		}

		default: {
			console.error(messages.commands.unknown(command));
			console.info(messages.commands.usage);
			process.exit(1);
		}
	}
} catch (err) {
	// Catch any fatal errors during initial boot or production build
	const payload = toPayload(err);
	console.error(renderErrorToTerminal(payload));
	process.exit(1);
}
