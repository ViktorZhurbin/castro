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

import { cleanupTempDir, setupCleanupOnExit } from "./config.js";

// Set up cleanup handlers
setupCleanupOnExit();
cleanupTempDir();

// Parse command
const command = process.argv[2] || "dev";

switch (command) {
	case "dev":
		// Start dev server
		const { startDevServer } = await import("./dev/server.js");
		await startDevServer();
		break;

	case "build":
		// Production build
		process.env.NODE_ENV = "production";
		const { buildAll } = await import("./build/builder.js");
		await buildAll({ verbose: true });
		break;

	default:
		console.error(`Unknown command: ${command}`);
		console.info("Usage: castro [dev|build]");
		process.exit(1);
}
