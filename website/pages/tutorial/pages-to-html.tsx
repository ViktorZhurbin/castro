import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Pages to HTML — Castro Tutorial",
	layout: "tutorial",
	slug: "pages-to-html",
};

export default function PagesToHtml() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 2</span>
				<h1>Pages — From Source to HTML</h1>
				<p className="chapter-subtitle">
					Two entry formats, one rendering pipeline.
				</p>
			</header>

			<p>
				Every page in Castro starts as either a Markdown file or a JSX/TSX
				component. Both formats pass through distinct parsing stages but
				converge at the same point: a VNode that gets handed to{" "}
				<code>renderToString()</code> inside a layout.
			</p>

			<h2>Markdown Pages</h2>

			<p>
				Markdown files use YAML frontmatter (delimited by <code>---</code>) to
				declare metadata — title, layout, slug, and any custom fields. The
				frontmatter is parsed first, then the Markdown body is compiled to HTML
				using Bun's built-in Markdown compiler.
			</p>

			<pre className="code-block">
				<code>
					{"---\n"}
					{"title: My Page\n"}
					{"layout: default\n"}
					{"---\n\n"}
					{"# Hello\n"}
					{"This becomes HTML."}
				</code>
			</pre>

			<p>
				The compiled HTML string is wrapped into a VNode using{" "}
				<code>dangerouslySetInnerHTML</code>. This is the one place in Castro
				where raw HTML injection is intentional — the Markdown compiler is
				trusted, and the result needs to be a VNode so it can compose with
				layouts like any JSX page.
			</p>

			<p className="source-ref">
				See: <code>builder/build-page.js</code> (Markdown branch)
			</p>

			<h2>JSX Pages</h2>

			<p>
				JSX pages export a <code>meta</code> object and a default function
				component. The file is compiled with <code>Bun.build()</code>, the
				resulting module is imported, and its default export is called to
				produce a VNode tree.
			</p>

			<pre className="code-block">
				<code>
					{"export const meta: PageMeta = {\n"}
					{'  title: "My Page",\n'}
					{'  layout: "default",\n'}
					{"};\n\n"}
					{"export default function MyPage() {\n"}
					{"  return <h1>Hello</h1>;\n"}
					{"}"}
				</code>
			</pre>

			<p>
				The key detail: <code>Bun.build()</code> runs with two plugins that
				transform the module before it's ever imported. These plugins are what
				make island architecture possible at compile time.
			</p>

			<p className="source-ref">
				See: <code>builder/compile-jsx.js</code>
			</p>

			<h2>The Two Plugins</h2>

			<p>
				Every JSX page compilation passes through two Bun.build plugins. They
				run at compile time, before any rendering happens.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">Bun.build( page.tsx )</span>
				{"\n"}
				{"      │\n"}
				{"      ├─ "}
				<span className="hl">castroExternalsPlugin</span>
				{"\n"}
				{"      │    Marks Castro's internal modules as external.\n"}
				{"      │    Every page shares the "}
				<span className="hl-red">same singleton</span>
				{" instances\n"}
				{"      │    of registry, marker, and framework config.\n"}
				{"      │    Without this, each compiled page would get\n"}
				{"      │    its own copy and island tracking would break.\n"}
				{"      │\n"}
				{"      └─ "}
				<span className="hl">islandMarkerPlugin</span>
				{"\n"}
				{"           Intercepts every "}
				<span className="hl-red">.island.tsx</span>
				{" import.\n"}
				{"           Replaces the file contents with a stub that\n"}
				{"           calls "}
				<span className="hl">renderMarker()</span>
				{" instead of the\n"}
				{"           original component.\n"}
				{"\n"}
				{"           "}
				<span className="dim">This is the trick that makes islands work —</span>
				{"\n"}
				{"           "}
				<span className="dim">explained in Chapter 4.</span>
			</pre>

			<p className="source-ref">
				See: <code>builder/compile-jsx.js</code> |{" "}
				<code>islands/build-plugins.js</code>
			</p>

			<h2>CSS Extraction</h2>

			<p>
				When a page or its components import CSS files, <code>Bun.build</code>{" "}
				extracts them as separate <code>.css</code> files in the output. Each
				page only ships the CSS it actually imports — there is no global CSS
				bundle beyond what the layout provides. Island CSS is tracked separately
				(per-page) and injected only for islands that were actually rendered.
			</p>

			<p className="source-ref">
				See: <code>builder/build-page.js</code> |{" "}
				<code>builder/write-css.js</code>
			</p>

			<h2>From VNode to File</h2>

			<p>
				After compilation and rendering, the resulting HTML string passes
				through one final stage: asset injection. CSS links, script tags, import
				maps, and the island hydration runtime are assembled into the HTML
				document. The complete string is written to <code>dist/</code> as a
				static <code>.html</code> file.
			</p>

			<p className="source-ref">
				See: <code>builder/render-page.js</code> |{" "}
				<code>builder/write-html-page.js</code>
			</p>
		</>
	);
}
