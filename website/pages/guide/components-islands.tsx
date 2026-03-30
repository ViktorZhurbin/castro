import type { PageMeta } from "@vktrz/castro";
import CastroFiveYearPlan from "../../components/castro-jsx/CastroFiveYearPlan.island.tsx";
import CastroPropagandaRadio from "../../components/castro-jsx/CastroPropagandaRadio.island.tsx";
import CastroRedactor from "../../components/castro-jsx/CastroRedactor.island.tsx";
import { Note } from "../../components/Note.tsx";
import PropagandaRadio from "../../components/PropagandaRadio.island.tsx";
import SolidFiveYearPlan from "../../components/solid/SolidFiveYearPlan.island.tsx";

export const meta: PageMeta = {
	title: "Components & Islands — Castro Guide",
	layout: "docs",
	path: "/guide/components-islands",
	section: "guide",
};

export default function ComponentsIslands() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						COMPONENTS & ISLANDS
					</h1>
					<p className="text-base-content max-w-2xl">
						Everything in Castro is static by default. Components, pages, and
						layouts are server-rendered JSX with zero JavaScript shipped.
						Islands are the exception — opt-in interactive components with
						controlled hydration.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Section 1: JSX & Static Components */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						JSX & STATIC COMPONENTS
					</h2>
					<p className="text-base-content mb-4">
						Pages, layouts, and components are plain <code>.tsx</code> files.
						Write regular JSX — no special setup required:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// components/Card.tsx
export function Card({ title, children }) {
  return (
    <div class="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// pages/index.tsx
import { Card } from "../components/Card.tsx";

export default function Index() {
  return <Card title="Hello">World</Card>;
}`}</code>
					</pre>
					<Note>
						Static components ship zero JavaScript. They're server-rendered at
						build time and delivered as plain HTML. Only{" "}
						<code>.island.tsx</code> files send JavaScript to the browser.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Section 2: Islands & Directives */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						INTERACTIVE ISLANDS
					</h2>
					<p className="text-base-content mb-4">
						Add the <code>.island</code> suffix to make a component interactive.
						Islands are still server-rendered at build time, but their
						JavaScript also ships to the browser for hydration:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// components/Counter.island.tsx
import { createSignal } from "@vktrz/castro/signals";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = createSignal(initial);
  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {() => count()}
    </button>
  );
}

// pages/index.tsx
import Counter from "../components/Counter.island.tsx";

export default function Index() {
  return <Counter initial={5} />;
}`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Directives */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						CLIENT DIRECTIVES
					</h2>
					<p className="text-base-content mb-4">
						Directives control <em>when</em> an island's JavaScript loads and
						hydrates. Every island gets server-rendered HTML at build time — the
						directive only affects the client-side behavior.
					</p>

					<div className="overflow-x-auto mb-6">
						<table className="table">
							<thead>
								<tr>
									<th>Directive</th>
									<th>When JS loads</th>
									<th>Best for</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>comrade:eager</code>
									</td>
									<td>Immediately on page load</td>
									<td>Navigation, search, auto-play, analytics</td>
								</tr>
								<tr>
									<td>
										<code>comrade:patient</code>
									</td>
									<td>When browser is idle</td>
									<td>Secondary controls, toggles, non-critical UI</td>
								</tr>
								<tr>
									<td>
										<code>comrade:visible</code> (default)
									</td>
									<td>When scrolled into view</td>
									<td>Most islands</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Note>
						If you don't need client-side interactivity at all, don't make it an
						island — use a regular <code>.tsx</code> component instead. It will
						be server-rendered with zero JavaScript shipped.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:eager */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-4">
						COMRADE:EAGER
					</h2>
					<p className="text-base-content/80 italic mb-4">
						"Some comrades wait. This one doesn't."
					</p>
					<p className="text-base-content mb-4">
						Hydrates immediately on page load. Use this for content that must be
						interactive from the start: navigation menus, search bars,
						auto-playing media, analytics widgets.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`<PropagandaRadio comrade:eager />`}</code>
					</pre>
					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<CastroPropagandaRadio comrade:eager />
					</div>
					<p className="text-xs text-base-content/80 mt-2">
						The radio is already cycling headlines — JS loaded on page load, no
						interaction needed.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:patient */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-4">
						COMRADE:PATIENT
					</h2>
					<p className="text-base-content/80 italic mb-4">
						"I'll hydrate when everyone else is done"
					</p>
					<p className="text-base-content mb-4">
						Hydrates after the page settles, using{" "}
						<code>requestIdleCallback</code>. Good for interactive elements that
						don't need to respond instantly: comment sections, toggles,
						secondary controls.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`<Redactor comrade:patient />`}</code>
					</pre>
					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<CastroRedactor comrade:patient />
					</div>
					<p className="text-xs text-base-content/80 mt-2">
						Censorship activates after the browser settles.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:visible */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-4">
						COMRADE:VISIBLE{" "}
						<span className="badge badge-primary ml-2">DEFAULT</span>
					</h2>
					<p className="text-base-content/80 italic mb-4">
						"Only work when the people are watching"
					</p>
					<p className="text-base-content mb-4">
						Hydrates when the element scrolls into the viewport, using{" "}
						<code>IntersectionObserver</code> with a 100px buffer. The default —
						if you don't specify a directive, your island uses this.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// Explicit:
<FiveYearPlan comrade:visible />

// Or just omit the directive (same result):
<FiveYearPlan />`}</code>
					</pre>

					<div className="py-6 px-6 text-center border-2 border-dashed border-base-300 mb-4">
						<p className="text-base-content/80">
							↓ Scroll down to see <code>comrade:visible</code> in action ↓
						</p>
					</div>

					<div style={{ minHeight: "400px" }} />

					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<CastroFiveYearPlan comrade:visible />
					</div>
					<p className="text-xs text-base-content/80 mt-2">
						The progress tracker only hydrated when you scrolled here. Check
						DevTools Network to verify.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Section 3: Multi-Framework */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						MULTI-FRAMEWORK
					</h2>
					<p className="text-base-content mb-4">
						Castro supports castro-jsx, Preact, and Solid out of the box. All
						three can appear on the same page. Pick the framework per island —
						not per project.
					</p>

					<div className="overflow-x-auto mb-6">
						<table className="table">
							<thead>
								<tr>
									<th>Framework</th>
									<th>Best For</th>
									<th>Bundle size</th>
									<th>Trade-off</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>castro-jsx</code>
									</td>
									<td>Simple widgets, learning reactivity</td>
									<td>~2KB</td>
									<td>No effect cleanup, no batching</td>
								</tr>
								<tr>
									<td>
										<code>preact</code>
									</td>
									<td>Complex hierarchies, familiar React API</td>
									<td>~9KB from CDN</td>
									<td>Slightly larger bundle</td>
								</tr>
								<tr>
									<td>
										<code>solid</code>
									</td>
									<td>Fine-grained reactivity with clean syntax</td>
									<td>~18KB from CDN</td>
									<td>Larger bundle, different mental model</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Directory convention */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						DIRECTORY CONVENTION
					</h2>
					<p className="text-base-content mb-4">
						Set <code>defaultIslandFramework</code> in{" "}
						<code>castro.config.js</code> to choose which framework islands use
						by default. If not specified, it defaults to Preact.
					</p>
					<p className="text-base-content mb-4">
						To use other frameworks place it inside a directory named after a
						registered framework ID:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`components/
├── Counter.island.tsx          ← uses default framework
├── castro-jsx/
│   └── Counter.island.tsx     ← detected as castro-jsx
└── solid/
    └── Counter.island.tsx     ← detected as Solid`}</code>
					</pre>
					<Note>
						The framework directory name must match the framework's{" "}
						<code>id</code> exactly: <code>solid/</code>,{" "}
						<code>castro-jsx/</code>, <code>preact/</code>.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Type checking */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						TYPE CHECKING
					</h2>
					<p className="text-base-content mb-4">
						TypeScript only expects one JSX runtime per project, but each
						framework has its own JSX type definitions. When you use a
						non-default framework, TypeScript needs to know which types to
						apply. Two things are needed:
					</p>

					<p className="text-base-content mb-3">
						Add a <code>@jsxImportSource</code> comment as the first line of
						each island file that uses a non-default framework:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`/** @jsxImportSource @vktrz/castro-jsx */
import { createSignal } from "@vktrz/castro/signals";

/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";`}</code>
					</pre>
					<p className="text-base-content mb-4 text-sm text-base-content/70">
						This is a TypeScript feature, not a Castro invention. It tells the
						type checker which JSX types to use for this file. The build plugin
						handles the actual compilation regardless — the pragma only affects
						type checking.
					</p>

					<Note>
						Multi-framework type setup isn't the smoothest DX. Castro's goal is
						to let you <em>choose</em> the right framework per island — mixing
						multiple frameworks on one site is a side effect of that
						flexibility, not the primary use case. Most projects will pick one
						framework and never need any of this.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Live demo */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						LIVE DEMO: THREE FRAMEWORKS, ONE PAGE
					</h2>
					<p className="text-base-content mb-8">
						Three islands below, three different frameworks. Castro handles
						separate compilation and import maps automatically. Open DevTools
						Network to see Preact, castro-jsx runtime, and Solid load
						independently.
					</p>

					<div className="space-y-6">
						<div className="card card-border border-accent bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-2xl text-accent">
									CASTRO-JSX
								</h3>
								<p className="text-sm text-base-content/80">
									Castro's own runtime. Signals + direct DOM, no virtual DOM, no
									CDN.
								</p>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<CastroRedactor />
								</div>
							</div>
						</div>

						<div className="card card-border border-primary bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-2xl text-primary">
									PREACT
								</h3>
								<p className="text-sm text-base-content/80">
									Virtual DOM diffing. Loaded from CDN via import map.
								</p>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<PropagandaRadio />
								</div>
							</div>
						</div>

						<div className="card card-border border-secondary bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-2xl text-secondary">
									SOLID
								</h3>
								<p className="text-sm text-base-content/80">
									Compiled reactive DOM. Fine-grained updates without a virtual
									DOM. Loaded from CDN via import map.
								</p>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<SolidFiveYearPlan />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* What happens under the hood */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						WHAT HAPPENS UNDER THE HOOD
					</h2>
					<ul className="space-y-3 text-base-content mb-4">
						<li>
							<strong>Discovery</strong> — the registry checks each island's
							file path against known framework directories to resolve its
							framework ID.
						</li>
						<li>
							<strong>SSR</strong> — each island is server-rendered using its
							framework's <code>renderSSR()</code> and wrapped in a{" "}
							<code>{"<castro-island>"}</code> element.
						</li>
						<li>
							<strong>Client hydration</strong> — each island's client bundle
							calls its own framework's hydrate function. Preact and Solid load
							independently from CDN via import map.
						</li>
					</ul>
					<p className="text-sm text-base-content/70">
						<a href="/how-it-works" className="underline">
							Deep dive: The Build Pipeline →
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a
							href="/guide/quick-start"
							className="btn btn-outline btn-primary"
						>
							← Quick Start
						</a>
						<a href="/guide/plugins" className="btn btn-outline btn-primary">
							Plugins →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
