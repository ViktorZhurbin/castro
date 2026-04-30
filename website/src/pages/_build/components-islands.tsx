import Redactor from "@/components/islandExamples/Redactor.island";

export const meta = {
	title: "Components & Islands - Castro Guide",
	layout: "docs",
	path: "/build/components-islands",
};

export default function ComponentsIslands() {
	return (
		<>
			{/* ─── HEADER ─────────────────────────────────────────────── */}
			<h1>COMPONENTS & ISLANDS</h1>
			<p>
				New to island architecture?{" "}
				<a href="/concept/island-architecture">Start here</a> — this page covers
				the mechanics.
			</p>
			<p>
				Every component in Castro starts as static HTML. You add interactivity
				by choosing the right tool for the job.
			</p>

			{/* Summary table */}
			<div class="overflow-auto">
				<table>
					<thead>
						<tr>
							<th>Tool</th>
							<th>JS shipped</th>
							<th>When to use</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<strong>Static component</strong>
							</td>
							<td>
								<code>0 bytes</code>
							</td>
							<td>Anything that doesn't need the DOM at runtime</td>
						</tr>
						<tr>
							<td>
								<strong>Framework island</strong>
							</td>
							<td>Your code + framework runtime</td>
							<td>Reactive state, complex UI</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* ─── STATIC COMPONENTS ───────────────────────────────────── */}
			<h2>STATIC COMPONENTS</h2>
			<p>
				Pages, layouts, and components are plain <code>.tsx</code> files. They
				are rendered at build time and delivered as plain HTML. Write regular
				JSX - no setup required:
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

			{/* ─── ISLANDS ─────────────────────────────────────────────── */}
			<h2>THE HYDRATION LINE</h2>
			<p>
				An <code>.island.tsx</code> file is where Castro crosses from static
				markup into client interactivity.
			</p>
			<p>
				At build time, an island is server-rendered to static HTML with zero
				JavaScript. In the browser, it hydrates in place, attaching to the
				existing HTML. You dictate exactly <b>when</b> this happens using a
				client directive.
			</p>

			{/* ─── FRAMEWORK ISLANDS ───────────────────────────────────── */}
			<h2>FRAMEWORK ISLANDS</h2>
			<p>
				The standard island: server-rendered at build time, hydrated on the
				client with a framework runtime. Use when you need reactive state.
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
import Counter from "../components/Counter.island.tsx";

export default function Index() {
  return <Counter initial={5} />;
}`}</code>
			</pre>

			{/* ─── CLIENT DIRECTIVES ─────────────────────────── */}
			<h2>CLIENT DIRECTIVES</h2>
			<p>
				Castro provides three directives to control exactly when an island's
				JavaScript is fetched and executed.
			</p>

			<h3>
				<code>comrade:visible</code>
			</h3>

			<span class="badge badge-dashed">default</span>

			<blockquote>"Only work when the people are watching."</blockquote>

			<p>
				Hydrates when the element enters the viewport. The right default for
				most islands - JavaScript loads only when the user actually reaches the
				component.
			</p>

			<h3>
				<code>comrade:patient</code>
			</h3>

			<blockquote>"I'll hydrate when everyone else is done."</blockquote>

			<p>
				Hydrates after the browser goes idle. For important but non-critical UI
				- loaded early, doesn't block anything.
			</p>

			<h3>
				<code>comrade:eager</code>
			</h3>

			<blockquote>"Some comrades wait. This one doesn't."</blockquote>

			<p>
				Hydrates immediately when the element connects to the DOM. Use for
				critical UI above the fold where interactivity is a state requirement.
			</p>

			<h3>LIVE DEMONSTRATION</h3>
			<p>
				Open your DevTools network tab. Reload the page and scroll to this
				component. Before hydration, it is pure, state-approved HTML. As you
				scroll to it, the <code>comrade:visible</code> directive executes,
				component JS and the Preact runtime get distributed, and the component
				becomes interactive.
			</p>

			<Redactor />

			<pre>
				<code>{`import Redactor from "../components/Redactor.island.tsx";

export default function Page() {
  // No directive = comrade:visible by default
  return <Redactor />;
}`}</code>
			</pre>

			{/* ─── ALTERNATIVE FRAMEWORKS ──────────────────────────────── */}
			<h2>ALTERNATIVE FRAMEWORKS</h2>
			<p>
				The plugin system lets you register other frameworks - Castro detects
				which one to use per island by scanning imports and export signatures at
				build time.
			</p>

			<p>
				Register framework plugins in <code>castro.config.ts</code>:
			</p>
			<pre>
				<code>{`// castro.config.ts
import { defineConfig } from "@vktrz/castro";
import { castroSolid } from "@vktrz/castro-solid";

export default defineConfig({
  plugins: [castroSolid()],
});`}</code>
			</pre>

			<p>Then create islands using that framework:</p>

			<pre>
				<code>{`// Counter.island.tsx

/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);

  return (
		<button onClick={() => setCount(count() + 1)}>
			Count: {count()}
		</button>
	)
}`}</code>
			</pre>

			<aside class="alert">
				TypeScript expects one JSX runtime per project. Non-Preact islands need
				a <code>{`/** @jsxImportSource <framework> */`}</code> pragma comment at
				the top of the file - that's how the type checker knows which JSX types
				to apply.
				<br />
				<br />
				Different frameworks can coexist on the same page - a Preact counter and
				a Solid widget, side by side. They cannot nest or share state.
				<br />
				<br />
				Each framework ships its runtime once per page, shared across all
				islands that use it. Two Preact islands cost one Preact runtime. A
				Preact island and a Solid island cost two runtimes. Mix frameworks
				intentionally.
			</aside>

			<p>
				For building your own framework plugin, see{" "}
				<a href="/build/plugins">Plugins →</a>
			</p>

			<div class="btn-group">
				<a href="/build/quick-start" class="btn btn-base">
					← Quick Start
				</a>
				<a href="/build/plugins" class="btn btn-base">
					Plugins →
				</a>
			</div>
		</>
	);
}
