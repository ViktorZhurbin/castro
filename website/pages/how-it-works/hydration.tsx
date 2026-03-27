import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "Hydration — Castro Tutorial",
	layout: "docs",
	path: "/how-it-works/hydration",
	section: "how-it-works",
};

export default function Hydration() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						HYDRATION
					</h1>
					<p className="text-base-content max-w-2xl">
						The build pipeline produces static HTML with{" "}
						<code>{"<castro-island>"}</code> wrappers. Now the browser takes
						over — a custom element decides when and how to make each island
						interactive.
					</p>
				</div>
			</section>

			{/* Panel 1: The Custom Element */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						1. THE CUSTOM ELEMENT
					</h2>

					<p className="text-base-content max-w-2xl mb-8">
						The browser loads <code>castro-island.js</code> and registers a{" "}
						<code>{"<castro-island>"}</code> custom element. When one connects
						to the DOM, <code>connectedCallback()</code> reads the{" "}
						<code>directive</code> attribute and decides what happens next.
					</p>

					{/* Directive routing flowchart */}
					<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-8">
						{/* Entry */}
						<div className="card card-bordered border-base-300 bg-base-200 p-6 text-center">
							<span className="badge badge-primary mb-3 mx-auto">
								connectedCallback()
							</span>
							<p className="text-sm text-base-content/80">
								Fires when the element enters the DOM. Reads the{" "}
								<code>directive</code> attribute.
							</p>
						</div>

						{/* Arrow */}
						<div className="flex flex-col items-center gap-2 text-base-content/80">
							<span className="hidden md:block text-2xl">→</span>
							<span className="md:hidden text-2xl">↓</span>
						</div>

						<div className="flex flex-col gap-4">
							<div className="card card-bordered border-primary bg-base-200 p-4">
								<span className="badge badge-primary mb-2">
									comrade:visible
								</span>
								<p className="text-sm text-base-content/80">
									Wait for the element to enter the viewport via{" "}
									<code>IntersectionObserver</code> (with a 100px buffer). Then
									hydrate. This is the default — used when no directive is
									specified.
								</p>
							</div>
							<div className="card card-bordered border-accent bg-base-200 p-4">
								<span className="badge badge-accent mb-2">lenin:awake</span>
								<p className="text-sm text-base-content/80">
									Hydrate immediately. No waiting. JS loads as soon as the
									element connects.
								</p>
							</div>
						</div>
					</div>

					<p className="text-sm text-base-content/80 mt-4">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/hydration.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							hydration.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Panel 2: The Import */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						2. THE IMPORT
					</h2>

					<p className="text-base-content max-w-2xl mb-8">
						When it's time to hydrate, the element does{" "}
						<code>{'await import(this.getAttribute("import"))'}</code> to load
						its client bundle. The bundle contains a bare{" "}
						<code>{'import("preact")'}</code> — no URL. The import map, injected
						into the page's <code>{"<head>"}</code> by the build pipeline, is
						what tells the browser where to fetch it. The framework loads from
						the CDN and is cached across all islands on the page.
					</p>

					{/* Two-column: island bundle vs import map */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-display text-lg text-base-content mb-3">
								ISLAND BUNDLE
							</h3>
							<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`// Counter-a1b2.js
import Component from './Counter.tsx';

export default async (container, props) => {
  const { h, hydrate }
    = await import("preact");

  hydrate(h(Component, props), container);
};`}</code>
							</pre>
							<p className="text-xs text-base-content/80 mt-2">
								Generated at compile time. The <code>import("preact")</code>{" "}
								call is a bare specifier — it doesn't bundle Preact.
							</p>
						</div>

						<div>
							<h3 className="font-display text-lg text-primary mb-3">
								IMPORT MAP
							</h3>
							<pre className="bg-base-200 border-2 border-primary p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`<script type="importmap">
{
  "imports": {
    "preact":
      "https://esm.sh/preact",
    "preact/hooks":
      "https://esm.sh/preact/hooks"
  }
}
</script>`}</code>
							</pre>
							<p className="text-xs text-base-content/80 mt-2">
								Injected into every page that uses islands. Framework defaults
								are merged with any entries from{" "}
								<a href="/guide/configuration" className="underline">
									importMap
								</a>{" "}
								in your config (user entries win on conflict). The browser
								resolves bare specifiers to CDN URLs.
							</p>
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
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/builder/writeHtmlPage.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							writeHtmlPage.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Panel 3: The Mount */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-8">
						3. THE MOUNT
					</h2>

					<p className="text-base-content max-w-2xl mb-4">
						The client bundle's default export is a mounting function, generated
						at compile time with a framework-specific{" "}
						<code>hydrateFnString</code>. The custom element calls{" "}
						<code>module.default(this, props)</code> — the framework takes over
						the existing SSR HTML inside the container. No re-render, just
						attaching event listeners to the existing DOM.
					</p>

					<Note className="mb-6">
						<code>hydrate()</code> is different from <code>render()</code> — it
						reuses the server-rendered DOM nodes instead of replacing them. The
						page never flashes or re-renders. It just becomes interactive.
					</Note>

					{/* The hydration sequence */}
					<div className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto">
						<pre className="text-sm leading-relaxed">
							<code>
								<span className="text-base-content/80">{`// Inside hydration.js — the hydrate() method

`}</span>
								{`const propsJson = this.dataset.props;
const props = propsJson ? JSON.parse(propsJson) : {};

`}
								<span className="text-base-content/80">{`// Dynamic import — triggers network request for the island JS
`}</span>
								{`const module = await import(this.getAttribute("import"));

`}
								<span className="text-base-content/80">{`// Call the mounting function — framework hydrates the container
`}</span>
								<span className="border-l-4 border-primary pl-3 inline-block">{`await module.default(this, props);`}</span>
								{"\n\n"}
								<span className="text-base-content/80">{`// Mark as ready (useful for CSS transitions or testing)
`}</span>
								{`this.setAttribute("ready", "");`}
							</code>
						</pre>
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
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworks/preact.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							frameworks/preact.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Summary */}
			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="bg-base-300 border-2 border-base-content/10 p-6 overflow-x-auto mb-8">
						<pre className="text-sm leading-relaxed">
							<code>{`HTML arrives
  → <castro-island> connects to DOM
    → directive decides timing
      → JS imports on demand (framework from CDN)
        → hydrate() attaches to existing DOM
          → interactive`}</code>
						</pre>
					</div>

					<p className="font-display text-2xl text-primary italic mb-8">
						The build pipeline produces the HTML. The custom element brings it
						to life.
					</p>

					<div className="flex flex-wrap gap-4">
						<a href="/how-it-works" className="btn btn-outline btn-primary">
							← Back to The Build Pipeline
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
