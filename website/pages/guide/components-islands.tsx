import Redactor from "@components/Redactor.island.tsx";
import type { PageMeta } from "@vktrz/castro";

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

			<div class="divider" />

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
					<aside class="alert">
						Static components are server-rendered at build time and delivered as
						plain HTML. Only <code>.island.tsx</code> files send JavaScript to
						the browser.
					</aside>
				</div>
			</section>

			<div class="divider" />

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

import Counter from "../components/Counter.island.tsx";

export default function Index() {
  return <Counter initial={5} />;
}`}</code>
					</pre>
				</div>
			</section>

			<div class="divider" />

			{/* Section 3: Directives */}
			<section>
				<div>
					<h2>CLIENT DIRECTIVES</h2>
					<p>
						These are special attributes that control when the island's
						JavaScript loads. Use directives to decide how your islands hydrate.
					</p>

					<h3>
						<code>comrade:eager</code>
					</h3>

					<blockquote>"Some comrades wait. This one doesn't."</blockquote>
					<p>
						<b>What it does:</b> Load immediately, block rendering
					</p>
					<p>
						<b>When to use:</b> Critical UI, above the fold, user input expected
					</p>

					<h3>
						<code>comrade:patient</code>
					</h3>
					<blockquote>"I'll hydrate when everyone else is done"</blockquote>
					<p>
						<b>What it does:</b> Load after the browser settles
					</p>
					<p>
						<b>When to use:</b> Important but not critical, moderate
						interactivity
					</p>

					<h3 class="flex gap-2 items-center">
						<code>comrade:visible</code>
						<span class="badge badge-dash badge-accent leading-none">
							default
						</span>
					</h3>
					<blockquote>"Only work when the people are watching"</blockquote>
					<p>
						<b>What it does:</b> Load when scrolled into view
					</p>
					<p>
						<b>When to use:</b> Below the fold, expensive to render, lazy
						loading
					</p>

					<h3>Example</h3>
					<p>Here's an island that hydrates when in viewport:</p>

					<Redactor />

					<pre>
						<code>{`import Redactor from "../components/Redactor.island.tsx";

export default function Page() {
  return <Redactor />; // uses the default "comrade:visible"
}`}</code>
					</pre>
				</div>
			</section>

			<div class="divider" />

			{/* Section 4: ClientScript */}
			<section>
				<div>
					<h2>
						<code>ClientScript</code>: ISLANDS WITHOUT A RUNTIME
					</h2>
					<p>
						Not every interactive element needs a framework. Theme toggles,
						scroll handlers, and DOM queries ship zero framework bytes — just a
						plain function serialized as an inline <code>{"<script>"}</code>.
					</p>
					<p>
						<code>ClientScript</code> accepts a function and optional
						JSON-serializable arguments. It serializes them as an IIFE at build
						time — no bundler, no hydration, no runtime:
					</p>
					<pre>
						<code>{`import { ClientScript } from "@vktrz/castro";

function initToggle(storageKey: string, dark: string, light: string) {
  const checkbox = document.querySelector("#toggle input") as HTMLInputElement;
  if (!checkbox) return;

  checkbox.checked = document.documentElement.getAttribute("data-theme") === dark;

  checkbox.addEventListener("change", (e) => {
    const next = (e.target as HTMLInputElement).checked ? dark : light;
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(storageKey, next);
  });
}

export default function ThemeToggle() {
  return (
    <>
      <label id="toggle">...</label>
      <ClientScript fn={initToggle} args={["theme", "dark", "light"]} />
    </>
  );
}`}</code>
					</pre>
					<p>
						The function is written and type-checked as normal TypeScript. It's
						only serialized via <code>.toString()</code> when the page renders.
						Args must be JSON-serializable — functions and symbols throw at
						build time.
					</p>
					<aside class="alert">
						Use <code>ClientScript</code> when you need to touch the DOM but
						don't need reactive state. It's the middle ground between a fully
						static component and a full island with a framework runtime.
					</aside>
				</div>
			</section>

			<div class="divider" />

			{/* Section 5: Vanilla Islands */}
			<section>
				<div>
					<h2>VANILLA ISLANDS</h2>
					<p>
						Sometimes you want Castro's island lifecycle — directives, prop
						serialization, lazy loading — but not a framework runtime. Vanilla
						islands let you write JSX for the server render and plain JavaScript
						for the client. Nothing else ships.
					</p>
					<p>
						Castro detects vanilla islands by their <code>hydrate</code> export
						signature. Write a default component for server-side JSX rendering,
						and a named <code>hydrate</code> function for client-side behavior:
					</p>
					<pre>
						<code>{`// components/Chart.island.tsx

// 1. Server-side (JSX): rendered at build time, zero JS shipped
export default function Chart(props: { data: number[] }) {
  return (
    <div class="chart-container">
      <canvas class="chart-canvas" />
    </div>
  );
}

// 2. Client-side (plain JS): only this ships to the browser
export function hydrate(container: HTMLElement, props: { data: number[] }) {
  const canvas = container.querySelector(".chart-canvas") as HTMLCanvasElement;
  // mount your D3 chart, Three.js scene, etc.
}`}</code>
					</pre>
					<p>Use it like any other island — all directives work:</p>
					<pre>
						<code>{`import Chart from "../components/Chart.island.tsx";

export default function Page() {
  return <Chart data={[1, 2, 3]} comrade:visible />;
}`}</code>
					</pre>
					<aside class="alert">
						The <code>hydrate</code> export receives the{" "}
						<code>{"<castro-island>"}</code> element as its container, not an
						inner wrapper. Query selectors work normally against it.
					</aside>
					<p>
						Vanilla islands are the right choice when you're wiring up a
						third-party library (D3, Three.js, Matter.js) or handling a
						localized interaction that doesn't need reactive state. You get the
						full island lifecycle — lazy loading, serialized props, CSS — while
						the client bundle stays pure JavaScript.
					</p>
				</div>
			</section>

			<div class="divider" />

			{/* Section 6: Multi-Framework (Advanced) */}
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
						Frameworks are detected automatically using AST scanning. Castro
						looks for:
					</p>

					<ol>
						<li>
							<strong>Export signatures:</strong> If an island exports specific
							names (e.g., <code>hydrate</code> for vanilla), it uses that
							framework.
						</li>
						<li>
							<strong>Import statements:</strong> If an island imports a
							framework package (e.g., <code>solid-js</code> or{" "}
							<code>@vktrz/castro-jsx</code>), it uses that framework.
						</li>
						<li>
							<strong>Default:</strong> Falls back to Preact.
						</li>
					</ol>

					<p>
						All islands go in your <code>components/</code> directory:
					</p>

					<pre>
						<code>{`components/
├── Counter.island.tsx                    ← Preact (default)
├── Chart.island.tsx                      ← Vanilla (detected via hydrate export)
├── SolidWidget.island.tsx                ← Solid (detected via solid-js import)
└── CastroButton.island.tsx               ← castro-jsx (detected via @vktrz/castro-jsx import)`}</code>
					</pre>

					<aside class="alert">
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

				<div class="divider" />

				<div class="flex flex-wrap gap-4">
					<a href="/guide/quick-start" class="btn btn-outline btn-primary">
						← Quick Start
					</a>
					<a href="/guide/plugins" class="btn btn-outline btn-primary">
						Plugins →
					</a>
				</div>
			</section>
		</>
	);
}
