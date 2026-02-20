import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Layouts — Castro Tutorial",
	layout: "tutorial",
	slug: "layouts",
};

export default function Layouts() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 3</span>
				<h1>Layouts — The HTML Shell</h1>
				<p className="chapter-subtitle">
					One render pass for the entire page tree.
				</p>
			</header>

			<p>
				Layouts are Preact components that wrap page content. Every page
				specifies a layout by name in its <code>meta.layout</code> field. The
				layout receives two props: <code>title</code> (from the page's metadata)
				and <code>children</code> (the page's VNode). The entire tree — layout,
				page content, and any islands — renders in a single{" "}
				<code>renderToString()</code> call.
			</p>

			<h2>VNode Composition</h2>

			<p>
				The layout wraps the page VNode as children, not as a pre-rendered HTML
				string. This distinction matters. The layout component receives actual
				VNodes it can compose, rearrange, or nest inside its own markup.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">
					layout({"{"} title, children: pageVNode {"}"})
				</span>
				{"\n"}
				{"        │\n"}
				{"        ▼\n"}
				{"  ┌─── "}
				<span className="hl-red">&lt;html&gt;</span>
				{" ───────────────────────┐\n"}
				{"  │  "}
				<span className="dim">&lt;head&gt;</span>
				{" title, CSS, fonts        │\n"}
				{"  │  "}
				<span className="dim">&lt;body&gt;</span>
				{"                          │\n"}
				{"  │    "}
				<span className="dim">&lt;main&gt;</span>
				{"                        │\n"}
				{"  │      ┌─── "}
				<span className="hl">children</span>
				{" ──────────┐   │\n"}
				{"  │      │  Page content (VNode) │   │\n"}
				{"  │      │  ┌────────────────┐   │   │\n"}
				{"  │      │  │ "}
				<span className="hl-red">island marker</span>
				{"  │   │   │\n"}
				{"  │      │  └────────────────┘   │   │\n"}
				{"  │      └───────────────────────┘   │\n"}
				{"  │    "}
				<span className="dim">&lt;/main&gt;</span>
				{"                       │\n"}
				{"  │  "}
				<span className="dim">&lt;/body&gt;</span>
				{"                         │\n"}
				{"  └──────────────────────────────────┘"}
			</pre>

			<p>
				When <code>renderToString()</code> walks this tree, it processes
				everything in order — the layout's HTML shell, the page content nested
				inside, and any island markers encountered along the way. No second pass
				needed.
			</p>

			<h2>The Layout Registry</h2>

			<p>
				At build startup, Castro scans the <code>layouts/</code> directory and
				compiles every layout file via <code>Bun.build</code>. The compiled
				modules are stored in a <code>Map</code> keyed by filename (without
				extension). A layout file named <code>tutorial.tsx</code> is referenced
				as <code>"tutorial"</code> in page metadata.
			</p>

			<pre className="code-block">
				<code>
					{"// Page references a layout by name\n"}
					{"export const meta: PageMeta = {\n"}
					{'  title: "My Page",\n'}
					{'  layout: "tutorial",\n'}
					{"};"}
				</code>
			</pre>

			<p>
				If a page omits the <code>layout</code> field, Castro falls back to the{" "}
				<code>"default"</code> layout. If the named layout doesn't exist in the
				registry, the build fails with a clear error.
			</p>

			<p className="source-ref">
				See: <code>layouts/registry.js</code>
			</p>

			<h2>Why VNodes, Not HTML Strings</h2>

			<p>
				Some SSGs pre-render page content to an HTML string, then inject it into
				a layout template. Castro takes a different approach: the page stays as
				a VNode tree until the very end. This has a concrete benefit.
			</p>

			<p>
				Island markers are components in the VNode tree. When{" "}
				<code>renderToString()</code> encounters one, it calls the marker
				function, which looks up the island in the registry and returns its
				server-rendered HTML wrapped in a <code>&lt;castro-island&gt;</code>{" "}
				element. If the page content were already an HTML string by the time it
				reached the layout, these markers would have been lost — they'd be raw
				text, not callable components.
			</p>

			<p>
				The single-pass VNode model means layouts, pages, and islands all
				participate in the same render. No special plumbing is needed to make
				islands work inside layouts, or layouts work with islands. It's just
				Preact components all the way down.
			</p>
		</>
	);
}
