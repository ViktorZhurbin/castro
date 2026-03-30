import type { PageMeta } from "@vktrz/castro";
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

			{/* Section 1: Static Components */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						STATIC COMPONENTS
					</h2>
					<p className="text-base-content mb-4">
						Pages, layouts, and components are plain <code>.tsx</code> files.
						Write regular JSX — no special setup required. Static components
						ship zero JavaScript:
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
						Static components are server-rendered at build time and delivered as
						plain HTML. Only <code>.island.tsx</code> files send JavaScript to
						the browser.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Section 2: Islands */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						INTERACTIVE ISLANDS
					</h2>
					<p className="text-base-content mb-4">
						Add the <code>.island</code> suffix to make a component interactive.
						Islands are server-rendered at build time, and their JavaScript
						ships to the browser for hydration:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// components/Counter.island.tsx
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
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

			{/* Section 3: Directives */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						CLIENT DIRECTIVES
					</h2>
					<p className="text-base-content mb-4">
						Islands hydrate on demand via directives — attributes that control
						when the island's JavaScript loads:
					</p>

					{/* Directives Table */}
					<div className="overflow-x-auto mb-8">
						<table className="table table-sm w-full">
							<thead>
								<tr>
									<th>Directive</th>
									<th>When to Use</th>
									<th>Example</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>comrade:eager</code>
									</td>
									<td>Load immediately, block rendering</td>
									<td>Critical UI, above the fold, user input expected</td>
								</tr>
								<tr>
									<td>
										<code>comrade:patient</code>
									</td>
									<td>Load after the browser settles</td>
									<td>Important but not critical, moderate interactivity</td>
								</tr>
								<tr>
									<td>
										<code>comrade:visible</code>
									</td>
									<td>Load when scrolled into view</td>
									<td>Below the fold, expensive to render, lazy loading</td>
								</tr>
							</tbody>
						</table>
					</div>

					<p className="text-base-content mb-6">
						Use directives to decide how your islands hydrate. Here's an island
						that hydrates immediately:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`import PropagandaRadio from "../components/PropagandaRadio.island.tsx";

export default function Page() {
  return <PropagandaRadio comrade:eager />;
}`}</code>
					</pre>

					<p className="text-base-content mb-4">
						Here's the island in action — JS loaded immediately:
					</p>

					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<PropagandaRadio comrade:eager />
					</div>

					<p className="text-xs text-base-content/80 mt-2">
						The radio is already cycling headlines. It loaded on page load (
						<code>comrade:eager</code>).
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Section 4: Multi-Framework */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						MULTI-FRAMEWORK
					</h2>
					<p className="text-base-content mb-4">
						Castro ships with Preact built-in. You can use other frameworks
						(Solid, castro-jsx, etc.) via plugins and directory convention.
						Place islands in a framework-specific subdirectory to use that
						framework:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`components/
├── Counter.island.tsx              ← Preact (default)
├── solid/
│   └── Counter.island.tsx          ← Solid (built-in support)
└── castro-jsx/
    └── Button.island.tsx           ← castro-jsx (external package)`}</code>
					</pre>

					<p className="text-base-content mb-4">
						Different frameworks on the same page is fine. Each loads
						independently. To add a new framework, check the{" "}
						<a href="/guide/plugins" className="link link-primary">
							Plugins
						</a>{" "}
						guide.
					</p>

					<p className="text-base-content mb-6">
						Below are islands using different frameworks on the same page:
					</p>

					{/* Multi-framework demo */}
					<div className="flex flex-col gap-6 mb-8">
						<div className="card card-border border-secondary bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-xl text-secondary">
									PREACT
								</h3>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<PropagandaRadio />
								</div>
							</div>
						</div>

						<div className="card card-border border-accent bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-xl text-accent">
									SOLID
								</h3>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<SolidFiveYearPlan />
								</div>
							</div>
						</div>

						<div className="card card-border border-accent bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-xl text-accent">
									castro-jsx
								</h3>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<CastroRedactor />
								</div>
							</div>
						</div>
					</div>

					<Note>
						The directory convention is automatic. Place islands in{" "}
						<code>components/solid/</code> and they'll use Solid. No config
						needed. The framework ID must match the directory name exactly:{" "}
						<code>solid/</code>, <code>preact/</code>, etc.
					</Note>

					{/* Type checking */}
					<h3 className="font-display text-xl md:text-2xl text-secondary mb-6 mt-8">
						TYPE CHECKING
					</h3>
					<p className="text-base-content mb-4">
						TypeScript only expects one JSX runtime per project, but each
						framework has its own JSX type definitions. For a framework other
						than Preact, TypeScript needs to know which types to apply. Add a{" "}
						<code>@jsxImportSource</code> comment as the first line of each such
						island:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// For castro-jsx islands
/** @jsxImportSource @vktrz/castro-jsx */

// For Solid.js islands
/** @jsxImportSource solid-js */`}</code>
					</pre>
					<Note>
						This is a TypeScript feature, not a Castro invention. It tells the
						type checker which JSX types to use for this file. The build plugin
						handles the actual compilation regardless — the comment only affects
						type checking.
					</Note>
				</div>
			</section>
		</>
	);
}
