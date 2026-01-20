import { buildAll } from "../core/builder.js";
import { cleanupTempDir } from "../utils/tempDir.js";

process.env.NODE_ENV = "production";

// Ensures cleanup happens on success or Ctrl+C
process.on("exit", cleanupTempDir);
process.on("SIGINT", () => process.exit());

cleanupTempDir();
await buildAll({ verbose: true });
