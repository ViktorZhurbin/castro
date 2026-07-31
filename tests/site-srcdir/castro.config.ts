import { defineConfig } from "@vktrz/castro";

// Pins the srcDir contract: output must always land under dist/ regardless
// of where sources live. See AUDIT.md #4 — layout CSS was the one place
// srcDir leaked into an emitted URL (dist/src/layouts/... instead of
// dist/layouts/...).
export default defineConfig({
	srcDir: "src",
});
