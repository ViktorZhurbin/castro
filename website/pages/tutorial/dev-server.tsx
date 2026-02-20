import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Dev Server — Castro Tutorial",
	layout: "tutorial",
	slug: "dev-server",
};

export default function DevServer() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 6</span>
				<h1>Dev Server — Watch & Reload</h1>
				<p className="chapter-subtitle">
					File watching, rebuilds, and SSE-based live reload.
				</p>
			</header>

			<p>
				The dev server is three pieces working in concert: a static file server,
				a file watcher that triggers rebuilds, and an SSE connection that tells
				the browser to refresh. None of these are complex on their own, but they
				need to cooperate without dropping errors or stalling the rebuild loop.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">Dev Server Architecture</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n\n"}
				{"  "}
				<span className="hl-red">File change</span>
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  Watcher detects"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ├── page change → "}
				<span className="hl">single page rebuild</span>
				{"\n"}
				{"      │"}
				{"\n"}
				{"      └── layout / component / island → "}
				<span className="hl">full rebuild</span>
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  SSE sends "}
				<span className="hl-red">"reload"</span>
				{" event"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  Browser calls "}
				<span className="hl">location.reload()</span>
			</pre>

			<p className="source-ref">
				Server: <code>dev/server.js</code> | Client:{" "}
				<code>dev/live-reload.js</code>
			</p>

			<h2>Static File Server</h2>

			<p>
				The server uses <code>Bun.serve</code> with clean URL resolution. A
				request for <code>/about</code> resolves to <code>about.html</code>. A
				request for <code>/blog</code> tries <code>blog/index.html</code>. If
				neither matches, the server falls back to <code>404.html</code> if one
				exists in the dist directory. This mirrors the behavior of common static
				hosting providers like Netlify and Vercel, so what works in dev works in
				production.
			</p>

			<h2>Watch Strategy</h2>

			<p>
				The watcher distinguishes between two categories of changes. A change to
				a page file (inside <code>pages/</code>) triggers only that page's
				rebuild — fast, since it skips every other page. A change to a layout,
				shared component, or island triggers a full rebuild, because any of
				those could affect multiple pages.
			</p>

			<p>
				Each watcher iteration wraps the rebuild in a try/catch. If a syntax
				error slips into a file, the build fails and the error is logged, but
				the watcher keeps running. Fix the error, save again, and the next
				rebuild succeeds. This is essential for a dev server — one bad keystroke
				shouldn't force you to restart the process.
			</p>

			<h2>Cache Busting</h2>

			<p>
				Bun's module loader caches imports by file path. Unlike Node, it ignores
				query strings entirely — appending <code>?t=123</code> to an import path
				doesn't bust the cache. This creates a problem for the dev server: when
				you edit a page and the watcher recompiles it, the compiled output is
				written to the same path, but Bun serves the stale cached version on the
				next import.
			</p>

			<p>
				Castro solves this by writing compiled files with content-hashed
				filenames. A page compiled from <code>post.tsx</code> might be written
				to <code>post.tsx.a1b2c3d4.js</code>, where the hash is derived from the
				file's content. When the source changes, the content changes, the hash
				changes, and Bun sees a new file path — no cache hit. The old hashed
				file is cleaned up after the new one is loaded.
			</p>

			<div className="flow-chart">
				<div className="flow-box">Source file changes: post.tsx</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box gold">
					Bun.build compiles to post.tsx.f7e8d9c0.js (new hash)
				</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box">import() sees new path — no cache hit</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box emphasis">
					Fresh module loaded, old hashed file cleaned up
				</div>
			</div>

			<p className="source-ref">
				Cache utility: <code>utils/cache.js</code> | Hash-based loading:{" "}
				<code>builder/compile-jsx.js</code>
			</p>
		</>
	);
}
