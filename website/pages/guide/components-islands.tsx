import Redactor from "@components/Redactor.island.tsx";

export const meta = {
	title: "Components & Islands - Castro Guide",
	layout: "docs",
	path: "/guide/components-islands",
};

export default function ComponentsIslands() {
	return (
		<>
			{/* ─── HEADER ─────────────────────────────────────────────── */}
			<section>
				<h1>COMPONENTS & ISLANDS</h1>
				<p>
					Every component in Castro starts as static HTML - rendered at build
					time, shipped to the browser as plain markup, zero JavaScript. You add
					interactivity by choosing how far up the spectrum to go.
				</p>
				<p>
					Four levels. Each adds capability and ships more JavaScript. The right
					choice is the lowest level that meets your needs.
				</p>

				{/* Spectrum summary table */}
				<table class="striped overflow-auto">
					<thead>
						<tr>
							<th>Level</th>
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
								<code>ClientScript</code>
							</td>
							<td>One inlined function</td>
							<td>DOM touch without reactive state</td>
						</tr>
						<tr>
							<td>
								<strong>Vanilla island</strong>
							</td>
							<td>Your code, no framework</td>
							<td>Third-party libs, localized interactions</td>
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
			</section>

			{/* ─── LEVEL 1: STATIC COMPONENTS ─────────────────────────── */}
			<section>
				<h2>LEVEL 1 - STATIC COMPONENTS</h2>
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
			</section>

			{/* ─── LEVEL 2: CLIENTSCRIPT ───────────────────────────────── */}
			<section>
				<h2>LEVEL 2 - Client Script</h2>
				<p>
					Not every interactive element needs a framework. Theme toggles, scroll
					handlers, and DOM queries often need a simple function -{" "}
					<code>ClientScript</code> serializes a plain function as an inline{" "}
					<code>{"<script>"}</code> IIFE. No bundler, no hydration, no runtime.
				</p>
				<pre>
					<code>{`import { ClientScript } from "@vktrz/castro";

export default function DummyThemeToggle() {
  return (
    <>
      <button id="toggle">Toggle</button>

	  {/* pass the function and its arguments */}
      <ClientScript fn={initButton} args={["dark", "light"]} />
    </>
  );
}

// plain JS/TS function, and direct DOM manipulation
function initButton(dark: string, light: string) {
  const button = document.querySelector<HTMLButtonElement>("#toggle");

  button?.addEventListener("change", () => {
    const current = document.documentElement.getAttribute("data-theme") || light;
    const next = current === light ? dark : light;

    document.documentElement.setAttribute("data-theme", next);
  });
}`}</code>
				</pre>
				<p>
					The function is written and type-checked as normal TypeScript. It's
					only serialized via <code>.toString()</code> when the page renders at
					build time. Args must be JSON-serializable - functions and symbols
					will throw an error. The above example renders to:
				</p>
				<pre>
					<code>{`<button>Toggle</button>
<script>(initButton initState(dark, light) {
  ...
})("dark", "light");
</script>`}</code>
				</pre>

				<aside class="alert">
					Function arguments must come through <code>args</code>.{" "}
					<code>ClientScript</code> can't close over variables from the
					surrounding module - it runs in a separate browser scope.
				</aside>
			</section>

			{/* ─── ISLANDS BRIDGE ──────────────────────────────────────── */}
			<section>
				<h2>THE HYDRATION LINE</h2>
				<p>
					An <code>.island.tsx</code> file is where Castro crosses from static
					markup into client interactivity.
				</p>
				<p>
					At build time, an island is server-rendered exactly like a Level 1
					component - producing static HTML with zero JavaScript. But in the
					browser, it hydrates in place, attaching to the existing HTML. You
					dictate exactly <b>when</b> this happens using a client directive.
				</p>
			</section>

			{/* ─── LEVEL 3: VANILLA ISLANDS ────────────────────────────── */}
			<section>
				<div>
					<h2>LEVEL 3 - "VANILLA" ISLANDS</h2>
					<p>
						The lifecycle above applies to all islands. "Vanilla" islands are a
						specific case: full lifecycle - prop serialization, lazy loading,
						directives - with zero framework runtime. The default export is
						Preact JSX for the server render; the named <code>hydrate</code>{" "}
						export is plain JavaScript for the browser. Nothing else ships:
					</p>
					<pre>
						<code>{`// components/Chart.island.tsx

// Rendered at build time to plain HTML
export default function Chart(props: { data: number[] }) {
  return (
    <div class="chart-container">
      <canvas class="chart-canvas" />
    </div>
  );
}

// Only this JS ships to the browser, no framework runtime
export function hydrate(container: HTMLElement, props: { data: number[] }) {
  const canvas = container.querySelector<HTMLCanvasElement>(".chart-canvas");
  // mount your D3 chart, Three.js scene, etc.
}`}</code>
					</pre>
					<pre>
						<code>{`import Chart from "../components/Chart.island.tsx";

export default function Page() {
  return <Chart data={[1, 2, 3]} comrade:visible />;
}`}</code>
					</pre>
					<p>
						Vanilla islands are the right choice when you're wiring up a
						third-party library (D3, Three.js, Matter.js) or handling a
						localized interaction that doesn't need reactive state. Full island
						lifecycle, zero framework bytes.
					</p>
				</div>
			</section>

			{/* ─── LEVEL 4: PREACT ISLANDS ─────────────────────────── */}
			<section>
				<div>
					<h2>LEVEL 4 - PREACT ISLANDS</h2>
					<p>
						Preact islands work the same way - server-rendered at build time,
						hydrated on the client - except the framework runtime ships to the
						browser too. Use them when you need reactive state.
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
				</div>
			</section>

			{/* ─── CLIENT DIRECTIVES ─────────────────────────── */}
			<section>
				<h2>CLIENT DIRECTIVES</h2>
				<p>
					You have the components. Now you can orchestrate them. Castro provides
					three directives to control exactly when an island's JavaScript is
					fetched and executed.
				</p>

				<h3>
					<code>comrade:visible</code>
				</h3>

				<p class="badge badge-dash">default</p>

				<blockquote>"Only work when the people are watching."</blockquote>

				<p>
					Hydrates when the element enters the viewport. The right default for
					most islands - JavaScript loads only when the user actually reaches
					the component.
				</p>

				<h3>
					<code>comrade:patient</code>
				</h3>

				<blockquote>"I'll hydrate when everyone else is done."</blockquote>

				<p>
					Hydrates after the browser goes idle. For important but non-critical
					UI - loaded early, doesn't block anything.
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
			</section>

			{/* ─── ALTERNATIVE FRAMEWORKS ──────────────────────────────── */}
			<section>
				<h2>ALTERNATIVE FRAMEWORKS</h2>
				<p>
					The plugin system lets you register other frameworks - Castro detects
					which one to use per island by scanning imports and export signatures
					at build time.
				</p>

				<p>
					Register framework plugins in <code>castro.config.js</code>:
				</p>
				<pre>
					<code>{`// castro.config.js
import { castroSolid } from "@vktrz/castro-solid";

export default {
  plugins: [castroSolid()],
};`}</code>
				</pre>

				<p>Then create islands using that framework:</p>

				<pre>
					<code>{`// Counter.island.tsx

/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>;
}`}</code>
				</pre>

				<aside class="alert">
					TypeScript expects one JSX runtime per project. Non-Preact islands
					need a <code>{`/** @jsxImportSource <framework> */`}</code> pragma
					comment at the top of the file - that's how the type checker knows
					which JSX types to apply.
					<br />
					<br />
					Different frameworks can coexist on the same page - a Preact counter
					and a Solid widget, side by side. They cannot nest or share state.
					<br />
					<br />
					Each framework ships its runtime once per page, shared across all
					islands that use it. Two Preact islands cost one Preact runtime. A
					Preact island and a Solid island cost two runtimes. Mix frameworks
					intentionally.
				</aside>

				<p>
					For building your own framework plugin, see{" "}
					<a href="/guide/plugins">Plugins →</a>
				</p>

				<div class="btn-group">
					<a href="/guide/quick-start" class="btn btn-base">
						← Quick Start
					</a>
					<a href="/guide/plugins" class="btn btn-base">
						Plugins →
					</a>
				</div>
			</section>
		</>
	);
}
