/**
 * Castro CLI — Entry point for the `castro` command.
 *
 * Usage:
 * - castro (or castro dev) → development server
 * - castro build → production build
 */

import { messages } from "./messages/index.js";
import { cleanupCacheDir } from "./utils/cache.js";

cleanupCacheDir();

const command = process.argv[2] || "dev";

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
		// that prevent natural process termination.
		process.exit(0);
	}

	default: {
		console.error(messages.commands.unknown(command));
		console.info(messages.commands.usage);
		process.exit(1);
	}
}
