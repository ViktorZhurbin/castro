/**
 * Tiny dev harness — the manual feedback loop. Compiles Counter.castro on each
 * request, bundles it with its runtime into one browser file, and serves a page
 * that mounts it. Edit the .castro file, refresh, watch it work. Not shipped.
 *
 *   bun run dev   (from packages/castro-dsl)
 */
import { compile } from "../src/index.js";

const CASTRO_FILE = new URL("./Counter.castro", import.meta.url);

/** Compile + bundle the .castro file into a single self-contained module. */
async function buildAppJs() {
	const source = compile(await Bun.file(CASTRO_FILE).text());

	// Bun.build needs a real entrypoint; keep it inside the package so the
	// workspace runtime imports resolve, then bundle them all inline.
	const entry = new URL("../dist/serve.entry.js", import.meta.url);
	await Bun.write(entry, source);

	const built = await Bun.build({
		entrypoints: [entry.pathname],
		target: "browser",
	});
	if (!built.success) throw new AggregateError(built.logs, "build failed");
	return built.outputs[0].text();
}

const PAGE = `<!doctype html>
<meta charset="utf-8" />
<title>castro-dsl</title>
<div id="app"></div>
<script type="module">
	import Component from "/app.js";
	document.getElementById("app").append(Component());
</script>`;

const server = Bun.serve({
	port: 3001,
	async fetch(req) {
		if (new URL(req.url).pathname === "/app.js") {
			return new Response(await buildAppJs(), {
				headers: { "content-type": "text/javascript" },
			});
		}
		return new Response(PAGE, { headers: { "content-type": "text/html" } });
	},
});

console.log(`castro-dsl playground → ${server.url}`);
