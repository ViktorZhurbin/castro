import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "The Big Picture — Castro Tutorial",
	layout: "tutorial",
	slug: "big-picture",
};

export default function BigPicture() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 1</span>
				<h1>The Big Picture</h1>
				<p className="chapter-subtitle">
					Two pipelines, one merge point, static HTML out.
				</p>
			</header>

			<h2>What Castro Does</h2>

			<p>
				Castro takes two kinds of source files — <strong>pages</strong> (JSX or
				Markdown) and <strong>islands</strong> (<code>.island.tsx</code>) — and
				produces static HTML with selective hydration. Pages become full HTML
				documents. Islands become interactive components that hydrate on the
				client, but only when and where you place them.
			</p>

			<p>
				The build runs two distinct compilation pipelines. They operate
				independently until a single merge point: <code>renderToString()</code>.
				That function walks the entire VNode tree and, when it encounters an
				island marker, pulls the island's SSR output from the registry and
				embeds it in the page HTML.
			</p>

			<h2>The Two Pipelines</h2>

			<pre className="diagram">
				{"  "}
				<span className="dim">SOURCE FILES</span>
				{"            "}
				<span className="dim">BUILD</span>
				{"                       "}
				<span className="dim">OUTPUT</span>
				{"\n"}
				{"  "}
				<span className="dim">────────────</span>
				{"            "}
				<span className="dim">─────</span>
				{"                       "}
				<span className="dim">──────</span>
				{"\n\n"}
				{"  "}
				<span className="hl">Pages Pipeline</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n"}
				{"  .tsx / .md"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  compile (Bun.build + 2 plugins)"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  import module → call default export → VNode"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  "}
				<span className="hl-red">
					renderToString( layout + page + islands )
				</span>
				{"  ◄── merge point"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  inject assets (CSS, scripts, import map)"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  "}
				<span className="hl">.html</span>
				{" + "}
				<span className="hl">.css</span>
				{"\n\n\n"}
				{"  "}
				<span className="hl">Islands Pipeline</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n"}
				{"  .island.tsx"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ├── compile for SSR  → ssrModule (server)"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      └── compile for client → .js bundle (browser)"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  registry (Map of island ID → { ssrModule, clientPath, css })"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  "}
				<span className="hl-red">renderToString()</span>
				{" reads from registry during page render"}
				{"\n"}
				{"      │"}
				{"\n"}
				{"      ▼"}
				{"\n"}
				{"  "}
				<span className="hl">.js</span>
				{" hydration bundles (only for interactive islands)"}
			</pre>

			<p className="source-ref">
				Entry: <code>cli.js</code> | Orchestration:{" "}
				<code>builder/build-all.js</code>
			</p>

			<h2>How They Converge</h2>

			<p>
				During page compilation, <code>Bun.build</code> intercepts every{" "}
				<code>.island.tsx</code> import and replaces it with a tiny marker stub.
				When <code>renderToString()</code> walks the page's VNode tree, those
				markers call into the island registry, which already holds pre-compiled
				SSR modules. The island's server-rendered HTML gets embedded directly
				into the page output, wrapped in a <code>&lt;castro-island&gt;</code>{" "}
				custom element that handles client-side hydration.
			</p>

			<p>
				This means the page pipeline doesn't need to know anything about island
				internals. It just renders VNodes. The island pipeline doesn't need to
				know about pages. They share exactly one interface: the registry, read
				at render time.
			</p>

			<h2>What Comes Out</h2>

			<p>
				The output is a <code>dist/</code> directory containing static{" "}
				<code>.html</code> files, extracted <code>.css</code> files, and{" "}
				<code>.js</code> bundles only for pages that use interactive islands.
				Pages with no islands (or only <code>no:pasaran</code> islands) ship
				zero JavaScript.
			</p>
		</>
	);
}
