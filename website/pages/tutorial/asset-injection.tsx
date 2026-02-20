import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Asset Injection — Castro Tutorial",
	layout: "tutorial",
	slug: "asset-injection",
};

export default function AssetInjection() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 5</span>
				<h1>Asset Injection — The Final Assembly</h1>
				<p className="chapter-subtitle">
					CSS, import maps, and scripts assembled into the final HTML.
				</p>
			</header>

			<p>
				After <code>renderToString()</code> produces an HTML string, the page is
				structurally complete but missing everything it needs to actually work
				in a browser. <code>write-html-page.js</code> handles the final assembly
				— gathering CSS, scripts, and metadata, then injecting them into the
				document.
			</p>

			<h2>What Gets Injected</h2>

			<p>
				Each page can accumulate up to six categories of assets during the
				build. Not all pages need all of them — a pure static page with no
				islands might only get page and layout CSS.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">Final HTML Assembly</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n\n"}
				{"  <html>"}
				{"\n"}
				{"  <head>"}
				{"\n"}
				{"    "}
				<span className="hl">Page CSS</span>
				{"           "}
				<span className="dim">← from page compilation</span>
				{"\n"}
				{"    "}
				<span className="hl">Layout CSS</span>
				{"         "}
				<span className="dim">← from layout compilation</span>
				{"\n"}
				{"    "}
				<span className="hl">Island CSS</span>
				{"         "}
				<span className="dim">← only for islands rendered on this page</span>
				{"\n"}
				{"    "}
				<span className="hl">Import map</span>
				{"         "}
				<span className="dim">
					← CDN URLs for Preact (if page has hydrating islands)
				</span>
				{"\n"}
				{"  </head>"}
				{"\n"}
				{"  <body>"}
				{"\n"}
				{"    "}
				<span className="dim">... rendered HTML ...</span>
				{"\n"}
				{"    "}
				<span className="hl-red">Island runtime</span>
				{"     "}
				<span className="dim">
					← castro-island.js custom element definition
				</span>
				{"\n"}
				{"    "}
				<span className="hl-red">Live reload</span>
				{"        "}
				<span className="dim">← SSE reconnection script (dev mode only)</span>
				{"\n"}
				{"  </body>"}
				{"\n"}
				{"  </html>"}
			</pre>

			<p className="source-ref">
				Assembly: <code>builder/write-html-page.js</code> | CSS extraction:{" "}
				<code>builder/write-css.js</code>
			</p>

			<h2>Per-Page Tracking</h2>

			<p>
				Not every island used in the project appears on every page. Injecting
				all island CSS globally would defeat the purpose of the island
				architecture. Instead, <code>marker.js</code> maintains a{" "}
				<code>pageState</code> object with a <code>usedIslands</code> Set that
				gets reset before each page render.
			</p>

			<p>
				As <code>renderToString()</code> walks the VNode tree and hits island
				markers, each marker adds its island ID to the set. After rendering
				completes, <code>write-html-page.js</code> reads this set and injects
				CSS only for the islands that actually appeared on the page.
			</p>

			<p>
				The <code>pageState</code> also tracks a <code>needsHydration</code>{" "}
				flag. If a page uses only <code>no:pasaran</code> islands (static, never
				hydrated), this flag stays <code>false</code> and the island runtime
				script is omitted entirely. That page ships zero client JavaScript — the
				island's HTML was rendered at build time and needs nothing more.
			</p>

			<div className="flow-chart">
				<div className="flow-box">renderToString() walks VNode tree</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box gold">
					Each island marker adds to usedIslands Set
				</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box">Render complete — check pageState</div>
				<div className="flow-arrow">▼</div>
				<div className="flow-box emphasis">
					Inject only CSS for used islands + runtime only if needsHydration
				</div>
			</div>

			<h2>Injection Points</h2>

			<p>
				CSS goes into <code>&lt;head&gt;</code> as <code>&lt;link&gt;</code>{" "}
				tags pointing to extracted <code>.css</code> files. The import map (a{" "}
				<code>&lt;script type="importmap"&gt;</code>) also lives in{" "}
				<code>&lt;head&gt;</code>, since browsers require it before any module
				scripts execute. Scripts — the island runtime and the dev-mode live
				reload client — are placed before <code>&lt;/body&gt;</code> so they
				don't block initial rendering.
			</p>

			<p>
				The import map itself maps bare specifiers like <code>"preact"</code>{" "}
				and <code>"preact/hooks"</code> to CDN URLs. This lets island client
				bundles use bare imports without a bundler on the client side — the
				browser resolves them through the map. The map is only injected on pages
				that have at least one hydrating island, since static-only pages never
				load module scripts.
			</p>

			<p className="source-ref">
				Page state: <code>islands/marker.js</code> | HTML output:{" "}
				<code>builder/write-html-page.js</code>
			</p>
		</>
	);
}
