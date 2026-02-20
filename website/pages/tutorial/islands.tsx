import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Islands — Castro Tutorial",
	layout: "tutorial",
	slug: "islands",
};

export default function Islands() {
	return (
		<>
			<header className="chapter-header">
				<span className="chapter-number">Chapter 4</span>
				<h1>Islands — The Core Architecture</h1>
				<p className="chapter-subtitle">
					Double compilation, marker swaps, and selective hydration.
				</p>
			</header>

			<p>
				Islands are the reason Castro exists. A static site generator that only
				renders static pages is a solved problem. The hard part is adding
				interactivity without shipping a full framework to the browser. Castro
				solves this through three phases: compile each island twice, swap
				imports with markers at build time, and hydrate selectively on the
				client.
			</p>

			<h2>Phase 1: Double Compilation</h2>

			<p>
				Every <code>.island.tsx</code> file gets compiled twice because it must
				run in two environments. The SSR build targets Bun — it produces a code
				string that can be imported on the server, with CSS modules stubbed out
				since the server doesn't need them. Its only purpose is to generate HTML
				at build time so the page isn't empty before JavaScript loads.
			</p>

			<p>
				The client build targets the browser. CSS is extracted to a separate
				file, and the JavaScript is written to <code>dist/islands/</code> with a
				content-hashed filename. The compiler wraps each island in a virtual
				entry module that exports a <code>mount</code> function — this is what
				the hydration runtime calls later.
			</p>

			<p>
				Both outputs are stored in the island registry: the SSR module for
				render-time use, the client path for the HTML attribute that tells the
				browser where to fetch the bundle.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">Double Compilation</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n\n"}
				{"              Counter"}
				<span className="hl">.island.tsx</span>
				{"\n"}
				{"                    │"}
				{"\n"}
				{"          ┌────────┴────────┐"}
				{"\n"}
				{"          │                 │"}
				{"\n"}
				{"          ▼                 ▼"}
				{"\n"}
				{"    "}
				<span className="hl-red">SSR build</span>
				{"            "}
				<span className="hl-red">Client build</span>
				{"\n"}
				{"    target: bun          target: browser"}
				{"\n"}
				{"    CSS: stubbed         CSS: extracted"}
				{"\n"}
				{"          │                 │"}
				{"\n"}
				{"          ▼                 ▼"}
				{"\n"}
				{"    "}
				<span className="hl">ssrModule</span>
				{"           "}
				<span className="hl">Counter-a1b2.js</span>
				{"\n"}
				{"    "}
				<span className="dim">(code string,</span>
				{"        "}
				<span className="dim">(hashed bundle +</span>
				{"\n"}
				{"    "}
				<span className="dim">{" kept in memory)"}</span>
				{"       "}
				<span className="dim">{" extracted .css)"}</span>
				{"\n"}
				{"          │                 │"}
				{"\n"}
				{"          └────────┬────────┘"}
				{"\n"}
				{"                   ▼"}
				{"\n"}
				{"           "}
				<span className="hl">Registry</span>
				{"\n"}
				{"    "}
				<span className="dim">{"{ ssrModule, clientPath, css }"}</span>
			</pre>

			<p className="source-ref">
				Compilation: <code>islands/compiler.js</code> | Plugins:{" "}
				<code>islands/build-plugins.js</code>
			</p>

			<h2>Phase 2: The Marker Swap</h2>

			<p>
				This is the cleverest part of the architecture. When{" "}
				<code>compile-jsx.js</code> processes a page that imports{" "}
				<code>Counter.island.tsx</code>, the <code>islandMarkerPlugin</code>{" "}
				intercepts the import. Instead of bundling the real component code into
				the page, it replaces the import with a stub that delegates to the
				island registry:
			</p>

			<pre className="code-block">
				<code>
					{
						'import { renderMarker } from "castro/islands/marker.js";\nexport default (props) => renderMarker("Counter.island.tsx", props);'
					}
				</code>
			</pre>

			<p className="source-ref">
				Stub generation: <code>islands/build-plugins.js</code>
			</p>

			<p>
				During <code>renderToString()</code>, the VNode tree hits{" "}
				<code>&lt;Counter /&gt;</code> and calls this stub function. The stub
				does three things: looks up the island in the registry, runs its SSR
				module to produce HTML, and wraps the result in a{" "}
				<code>&lt;castro-island&gt;</code> custom element with the directive,
				client bundle path, and serialized props as attributes. The page never
				imports the real component — it only ever sees the marker.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">VNode Tree Transformation</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n\n"}
				{"  "}
				<span className="dim">Before (page compilation):</span>
				{"\n\n"}
				{"  <Page>"}
				{"\n"}
				{"    ├── <h1>My Page</h1>"}
				{"\n"}
				{"    └── <"}
				<span className="hl-red">Counter</span>
				{" start={0} />"}
				{"\n"}
				{"         "}
				<span className="dim">
					↑ this is the marker stub, not the real component
				</span>
				{"\n\n"}
				{"  "}
				<span className="dim">After renderToString():</span>
				{"\n\n"}
				{"  <Page>"}
				{"\n"}
				{"    ├── <h1>My Page</h1>"}
				{"\n"}
				{"    └── <"}
				<span className="hl">castro-island</span>
				{"\n"}
				{'          directive="comrade:visible"'}
				{"\n"}
				{'          import="/islands/Counter-a1b2.js"'}
				{"\n"}
				{"          data-props='{\"start\":0}'>"}
				{"\n"}
				{"           "}
				<span className="hl">{"<button>Count: 0</button>"}</span>
				{"  "}
				<span className="dim">← SSR output</span>
				{"\n"}
				{"        </castro-island>"}
			</pre>

			<p className="source-ref">
				Marker logic: <code>islands/marker.js</code> | Registry:{" "}
				<code>islands/registry.js</code>
			</p>

			<h2>Phase 3: Client-Side Hydration</h2>

			<p>
				The browser receives static HTML. Every island is already rendered — the
				user sees content immediately. The <code>&lt;castro-island&gt;</code>{" "}
				custom element self-activates based on its <code>directive</code>{" "}
				attribute:
			</p>

			<ul>
				<li>
					<code>lenin:awake</code> — hydrate immediately on page load
				</li>
				<li>
					<code>comrade:visible</code> — use IntersectionObserver, hydrate when
					the element scrolls into view
				</li>
				<li>
					<code>no:pasaran</code> — never hydrate, stays as static HTML forever
					(no wrapper element is even emitted)
				</li>
			</ul>

			<p>
				When hydration triggers, the custom element fires a dynamic{" "}
				<code>import()</code> to fetch the client bundle. That bundle exports
				the <code>mount</code> function generated during the client compilation
				phase. The mount function calls Preact's <code>hydrate()</code>, which
				attaches event listeners to the existing DOM without re-rendering it.
				The static HTML becomes interactive with no visible flash.
			</p>

			<pre className="diagram">
				{"  "}
				<span className="hl">Hydration Timeline</span>
				{"\n"}
				{"  "}
				<span className="dim">
					───────────────────────────────────────────────────
				</span>
				{"\n\n"}
				{"  Page load"}
				{"\n"}
				{"    │"}
				{"\n"}
				{"    ▼"}
				{"\n"}
				{"  "}
				<span className="hl">HTML visible</span>
				{"      "}
				<span className="dim">(SSR content rendered, page is readable)</span>
				{"\n"}
				{"    │"}
				{"\n"}
				{"    ├── lenin:awake → "}
				<span className="hl-red">hydrate now</span>
				{"\n"}
				{"    │"}
				{"\n"}
				{"    ├── comrade:visible → "}
				<span className="dim">wait for IntersectionObserver</span>
				{"\n"}
				{"    │                       │"}
				{"\n"}
				{"    │                       ▼  "}
				<span className="dim">(element scrolls into view)</span>
				{"\n"}
				{"    │                   "}
				<span className="hl-red">hydrate</span>
				{"\n"}
				{"    │"}
				{"\n"}
				{"    └── no:pasaran → "}
				<span className="dim">no JS shipped, stays static</span>
				{"\n\n"}
				{"  "}
				<span className="dim">Hydration step:</span>
				{"\n"}
				{"    trigger fires → "}
				<span className="hl">{'import("/islands/Counter-a1b2.js")'}</span>
				{"\n"}
				{"                  → mount() → "}
				<span className="hl">{"Preact.hydrate()"}</span>
				{"\n"}
				{"                  → "}
				<span className="hl-red">interactive</span>
			</pre>

			<p className="source-ref">
				Custom element: <code>islands/hydration.js</code> | Runtime:{" "}
				<code>islands/plugins.js</code>
			</p>
		</>
	);
}
