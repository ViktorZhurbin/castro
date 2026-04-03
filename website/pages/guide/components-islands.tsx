import type { PageMeta } from "@vktrz/castro";
import PropagandaRadio from "../../components/PropagandaRadio.island.tsx";

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
			<section>
				<div>
					<h1>COMPONENTS & ISLANDS</h1>
					<p>
						Everything in Castro is static by default. Components, pages, and
						layouts are server-rendered JSX with zero JavaScript shipped.
						Islands are the exception — opt-in interactive components with
						controlled hydration.
					</p>
				</div>
			</section>

			<div className="divider" />

			{/* Section 1: Static Components */}
			<section>
				<div>
					<h2>STATIC COMPONENTS</h2>
					<p>
						Pages, layouts, and components are plain <code>.tsx</code> files.
						Write regular JSX — no special setup required. Static components
						ship zero JavaScript:
					</p>
					<pre>
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
					<aside className="alert">
						Static components are server-rendered at build time and delivered as
						plain HTML. Only <code>.island.tsx</code> files send JavaScript to
						the browser.
					</aside>
				</div>
			</section>

			<div className="divider" />

			{/* Section 2: Islands */}
			<section>
				<div>
					<h2>INTERACTIVE ISLANDS</h2>
					<p>
						Add the <code>.island</code> suffix to make a component interactive.
						Islands are server-rendered at build time, and their JavaScript
						ships to the browser for hydration.
					</p>
					<pre>
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

// Path aliases (e.g. @components/*) are supported
import Counter from "../components/Counter.island.tsx";

export default function Index() {
  return <Counter initial={5} />;
}`}</code>
					</pre>
				</div>
			</section>

			<div className="divider" />

			{/* Section 3: Directives */}
			<section>
				<div>
					<h2>CLIENT DIRECTIVES</h2>
					<p>
						Islands hydrate on demand via directives — attributes that control
						when the island's JavaScript loads:
					</p>

					{/* Directives Table */}
					<table>
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

					<p>
						Use directives to decide how your islands hydrate. Here's an island
						that hydrates immediately:
					</p>

					<pre>
						<code>{`import PropagandaRadio from "../components/PropagandaRadio.island.tsx";

export default function Page() {
  return <PropagandaRadio comrade:eager />;
}`}</code>
					</pre>

					<p>
						Here's the island in action — JS loaded immediately due to{" "}
						<code>comrade:eager</code> directive:
					</p>

					<PropagandaRadio comrade:eager />
				</div>
			</section>

			<div className="divider" />

			{/* Section 4: Multi-Framework (Advanced) */}
			<section>
				<div>
					<h2>ADVANCED: ALTERNATIVE FRAMEWORKS</h2>

					<p>
						Castro uses Preact for all static components and islands by default.
						However, the island architecture is extensible. For advanced use
						cases, you can author islands in other frameworks (like Solid) via
						plugins.
					</p>

					<p>
						Frameworks are applied automatically using a directory convention.
						Place the island in a subdirectory matching the framework's
						registered ID:
					</p>

					<pre>
						<code>{`components/
├── Counter.island.tsx              ← Preact (default)
├── solid/
│   └── Counter.island.tsx          ← Solid (built-in support)
└── castro-jsx/
    └── Button.island.tsx           ← castro-jsx (via plugin)`}</code>
					</pre>

					<aside className="alert">
						Because TypeScript only expects one JSX runtime per project,
						non-Preact islands require a{" "}
						<code>{`/** @jsxImportSource <framework> */`}</code> pragma at the
						top of the file so the type checker knows which JSX types to apply.
						<br />
						<br />
						For Solid, this would be:{" "}
						<code>{`/** @jsxImportSource solid-js */`}</code>
					</aside>

					<p>
						To learn how to add and configure custom framework runtimes, read
						the <a href="/guide/plugins">Plugins</a> guide.
					</p>
				</div>

				<div className="divider" />

				<div className="flex flex-wrap gap-4">
					<a href="/guide/quick-start" className="btn btn-outline btn-primary">
						← Quick Start
					</a>
					<a href="/guide/plugins" className="btn btn-outline btn-primary">
						Plugins →
					</a>
				</div>
			</section>
		</>
	);
}
