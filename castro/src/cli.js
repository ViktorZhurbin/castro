/**
 * Castro CLI
 *
 * Entry point for the `castro` command.
 * Parses arguments and runs the appropriate action.
 *
 * Commands:
 * - castro (or castro dev) - Start development server
 * - castro build - Build for production
 */

import { messages } from "./messages/index.js";
import { cleanupCacheDir } from "./utils/cache.js";

// Clean up old build artifacts at startup
cleanupCacheDir();

// Parse command
const command = process.argv[2] || "dev";

switch (command) {
	case "dev": {
		// Start dev server
		const { startDevServer } = await import("./dev/server.js");
		await startDevServer();
		break;
	}

	case "build": {
		// Production build
		process.env.NODE_ENV = "production";
		const { buildAll } = await import("./builder/build-all.js");
		await buildAll({ verbose: true });
		break;
	}

	default: {
		console.error(messages.commands.unknown(command));
		console.info(messages.commands.usage);
		process.exit(1);
	}
}
