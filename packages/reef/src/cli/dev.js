import { startDevServer } from "../dev/server.js";
import { cleanupTempDir } from "../utils/tempDir.js";

cleanupTempDir();
await startDevServer();
