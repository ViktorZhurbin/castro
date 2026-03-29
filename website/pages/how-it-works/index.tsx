import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "1. Build Pipeline — Castro",
	layout: "docs",
	path: "/how-it-works",
	section: "how-it-works",
};

export default function Tutorial() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						1. THE BUILD PIPELINE
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro compiles your pages and islands at build time. Three
						mechanisms turn your source files into fast, partially-hydrated
						HTML.
					</p>
				</div>
			</section>

			{/* Panel 1: The Split */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						1. THE DUAL COMPILATION
					</h2>

					<p className="text-base-content max-w-2xl mb-8">
						Islands compile before any pages are processed. Each{" "}
						<code>.island.tsx</code> file goes through <code>Bun.build</code>{" "}
						twice — once for the server (producing an SSR module that's
						pre-loaded into a registry) and once for the browser (producing a
						hashed JS bundle written to <code>dist/islands/</code>). The server
						needs a Bun module; the browser needs an ES module. Same source, two
						targets.
					</p>

					{/* Diagram: one source → two outputs */}
					<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
						{/* Source */}
						<div className="card card-bordered border-base-300 bg-base-200 p-6 text-center">
							<span className="badge badge-primary mb-3 mx-auto">
								Counter.island.tsx
							</span>
							<p className="text-sm text-base-content/80">
								Your island source file
							</p>
						</div>

						{/* Arrows */}
						<div className="flex flex-col items-center gap-2 text-base-content/80">
							<span className="hidden md:block text-2xl">→</span>
							<span className="hidden md:block text-2xl">→</span>
							<span className="md:hidden text-2xl">↓ ↓</span>
						</div>

						{/* Outputs */}
						<div className="flex flex-col gap-4">
							<div className="card card-bordered border-primary bg-base-200 p-5">
								<span className="badge badge-secondary mb-2">SSR Module</span>
								<p className="text-sm text-base-content/80">
									Runs at build time. Renders the island to HTML on the server.
									Stored in-memory, and accessed during page rendering.
								</p>
							</div>
							<div className="card card-bordered border-primary bg-base-200 p-5">
								<span className="badge badge-accent mb-2">Counter-a1b2.js</span>
								<p className="text-sm text-base-content/80">
									Client bundle. Put into <code>dist/islands/</code>. Loaded by
									the browser on demand.
								</p>
							</div>
						</div>
					</div>

					<p className="text-sm text-base-content/80 mt-4">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/compiler.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							compiler.js
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/registry.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							registry.js
						</a>
					</p>

					<Note className="mt-4">
						Islands can import CSS too. The build extracts each island's styles
						and injects them per-page — only CSS for islands actually rendered
						on a given page gets included.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Panel 2: The Swap */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						2. THE INTERCEPTION
					</h2>

					<p className="text-base-content max-w-2xl mb-8">
						When <code>Bun.build</code> compiles your page, the{" "}
						<code>islandMarkerPlugin</code> intercepts every{" "}
						<code>.island.tsx</code> import. Instead of bundling the real
						component, it swaps in a lightweight stub that calls{" "}
						<code>renderMarker()</code>. Your page never ships the interactive
						component code — just a function that knows how to look it up at
						render time.
					</p>

					{/* Before / After code comparison */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-display text-lg text-base-content mb-3">
								WHAT YOU WRITE
							</h3>
							<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`import Counter from
  "./Counter.island.tsx";

export default function Page() {
  return (
    <Counter initialCount={5} />
  );
}`}</code>
							</pre>
						</div>

						<div>
							<h3 className="font-display text-lg text-primary mb-3">
								WHAT IT COMPILES TO
							</h3>
							<pre className="bg-base-200 border-2 border-primary p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`import { renderMarker } from
  "castro/islands/marker.js";

const Counter = (props) =>
  renderMarker(
    "components/Counter.island.tsx",
    props
  );

export default function Page() {
  return Counter({ initialCount: 5 });
}`}</code>
							</pre>
						</div>
					</div>

					<p className="text-sm text-base-content/80 mt-4">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/buildPlugins.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							buildPlugins.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Panel 3: The Render */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						3. THE ASSEMBLY
					</h2>

					<p className="text-base-content max-w-2xl mb-4">
						<code>renderToString()</code> traverses the entire component tree in
						one synchronous pass — page, layout, and all. When it hits a marker
						stub, <code>renderMarker()</code> looks up the pre-loaded SSR
						module, renders the island to HTML, and wraps it in a{" "}
						<code>{"<castro-island>"}</code> element. The HTML block below is
						what that produces — the browser receives it before any JavaScript
						loads.
					</p>

					<Note className="mb-6">
						The <code>{"<castro-island>"}</code> custom element wraps
						server-rendered HTML. The <code>import</code> attribute points to
						the client JS bundle. The <code>directive</code> attribute controls
						when it hydrates.
					</Note>

					{/* HTML output with highlighted island */}
					<div className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto">
						<pre className="text-sm leading-relaxed">
							<code>
								<span className="text-base-content/80">{`<!DOCTYPE html>
<html>
  <head>
    <script type="importmap">
      { "imports": { "preact": "https://esm.sh/preact", ... } }
    </script>
    <script type="module" src="/castro-island.js"></script>
  </head>
  <body>
    <h1>My Page</h1>
    <p>Static content renders instantly.</p>

`}</span>
								<span className="text-base-content/80">
									{"    "}
									{"<!-- This is the island ↓ -->"}
								</span>
								{"\n"}
								<span className="border-l-4 border-primary pl-3 inline-block">{`<castro-island
  directive="comrade:visible"
  import="/islands/Counter-a1b2.js"
  data-props='{"initialCount":5}'>
    <button>Count: 5</button>
</castro-island>`}</span>
								{"\n\n"}
								<span className="text-base-content/80">{`  </body>
</html>`}</span>
							</code>
						</pre>
					</div>

					<p className="text-sm text-base-content/80 mt-4">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/marker.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							marker.js
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/builder/renderPage.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							renderPage.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Summary */}
			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						Example OUTPUT
					</h2>
					<pre className="bg-base-300 border-2 border-base-content/10 p-6 overflow-x-auto text-sm leading-relaxed mb-8">
						<code>{`dist/
├── index.html              ← static HTML with <castro-island> wrappers
├── islands/
│   └── Counter-a1b2.js     ← client bundle, loaded on demand
├── castro-island.js        ← hydration runtime (only if needed)
└── app.css                 ← styles`}</code>
					</pre>

					<p className="font-display text-2xl text-primary italic mb-8">
						HTML ships instantly. JavaScript loads on demand.
					</p>

					<div className="flex flex-wrap gap-4">
						<a
							href="/how-it-works/hydration"
							className="btn btn-outline btn-primary"
						>
							Next: Hydration →
						</a>
						<a
							href="/guide/quick-start"
							className="btn btn-outline btn-primary"
						>
							Quick Start Guide →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
