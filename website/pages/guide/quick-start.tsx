import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "Quick Start — Castro Guide",
	layout: "docs",
	path: "/guide/quick-start",
	section: "guide",
};

export default function QuickStart() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						QUICK START
					</h1>
					<p className="text-base-content max-w-2xl">
						Build a static site with interactive islands in a few minutes.
					</p>
				</div>
			</section>

			{/* Prerequisites */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						1. PREREQUISITES
					</h2>
					<p className="text-base-content mb-4">
						Castro runs on{" "}
						<a
							href="https://bun.sh"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							Bun
						</a>{" "}
						1.3.8+. It uses Bun's build pipeline, markdown parser, YAML parser,
						and dev server — Node won't work. If you don't have it:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`curl -fsSL https://bun.sh/install | bash  # takes ~10 seconds`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Install */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						2. INSTALL
					</h2>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`mkdir my-site && cd my-site
bun init -y
bun add @vktrz/castro`}</code>
					</pre>
					<p className="text-base-content mb-4">
						Add the build and dev scripts to <code>package.json</code>:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`{
  "scripts": {
    "dev": "castro dev",
    "build": "castro build"
  }
}`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Project structure */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						3. PROJECT STRUCTURE
					</h2>
					<p className="text-base-content mb-6">
						Castro follows a convention-over-configuration structure. There is
						no required config file — create the directories and start building.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`my-site/
├── layouts/          ← HTML shell components
├── pages/            ← one file = one output page
├── components/       ← shared components (not pages)
├── public/           ← copied to dist/ as-is
└── castro.config.js  ← optional`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Create a layout */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						4. CREATE A LAYOUT
					</h2>
					<p className="text-base-content mb-4">
						Layouts wrap your page content. The default layout is loaded
						automatically. Create <code>layouts/default.tsx</code>:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`import type { VNode } from "preact";

interface Props {
  title: string;
  children: VNode;
}

export default function DefaultLayout({ title, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}`}</code>
					</pre>
					<Note className="mt-4">
						Layouts and pages always use Preact — it's Castro's rendering engine
						at build time. Preact is never shipped to the browser unless you
						have Preact islands.
					</Note>
					<Note className="mt-3">
						Layouts must use a default export — the build pipeline loads{" "}
						<code>layoutModule.default</code>. It receives <code>title</code>{" "}
						(from page meta or filename), <code>children</code> (the page
						content), and any other fields from the page's <code>meta</code>{" "}
						export — all spread in by the build pipeline.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Create a page */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						5. CREATE A PAGE
					</h2>
					<p className="text-base-content mb-4">
						Pages live in <code>pages/</code>. Both <code>.tsx</code> and{" "}
						<code>.md</code> files are supported.
					</p>

					<Note className="mb-6">
						Pages require a default export (the component function). The named{" "}
						<code>meta</code> export is optional — it sets <code>title</code>,{" "}
						<code>layout</code>, and any custom fields passed to the layout.
					</Note>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-display text-lg text-base-content mb-3">
								TSX PAGE
							</h3>
							<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`// pages/index.tsx
import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
  title: "Home",
};

export default function Home() {
  return <h1>Hello, world!</h1>;
}`}</code>
							</pre>
						</div>

						<div>
							<h3 className="font-display text-lg text-base-content mb-3">
								MARKDOWN PAGE
							</h3>
							<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
								<code>{`---
title: About
---

# About

This page renders from Markdown.
Every \`.md\` file in \`pages/\`
becomes an HTML page.`}</code>
							</pre>
						</div>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Static components */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						6. ADD COMPONENTS
					</h2>
					<p className="text-base-content mb-4">
						Shared UI lives in <code>components/</code>. A regular{" "}
						<code>.tsx</code> component is server-rendered at build time — no
						JavaScript sent to the browser, no hydration, just HTML.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// components/Card.tsx
export function Card({ title, body }: { title: string; body: string }) {
  return (
    <div class="card">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}`}</code>
					</pre>
					<p className="text-base-content">
						Import and use it in any page — it renders to static HTML, nothing
						more.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Islands */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						7. ADD AN ISLAND
					</h2>
					<p className="text-base-content mb-6">
						You only need an island when a component requires client-side
						interactivity. Name it <code>*.island.tsx</code> — it gets
						pre-rendered at build time and hydrated in the browser.
					</p>
					<div className="tabs tabs-box">
						<input
							type="radio"
							name="islands"
							className="tab"
							aria-label="Preact"
							defaultChecked
						/>
						<div className="tab-content bg-base-100 border-base-300 p-4">
							<pre className="overflow-x-auto text-xs leading-relaxed">
								<code>{`// components/Counter.island.tsx
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return (
		<button onClick={() => setCount(count + 1)}>
    	Count: {count}
    </button>
  );
}`}</code>
							</pre>
						</div>

						<input
							type="radio"
							name="islands"
							className="tab"
							aria-label="castro-jsx"
						/>
						<div className="tab-content bg-base-100 border-base-300 p-4">
							<pre className="overflow-x-auto text-xs leading-relaxed">
								<code>{`// components/castro-jsx/CastroCounter.island.tsx
import { createSignal } from "@vktrz/castro-jsx/signals";

export default function CastroCounter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return (
		<button onClick={() => setCount((c) => c + 1)}>
			Castro: {count}
		</button>;
}
`}</code>
							</pre>
						</div>

						<input
							type="radio"
							name="islands"
							className="tab"
							aria-label="Solid"
						/>
						<div className="tab-content bg-base-100 border-base-300 p-4">
							<pre className="overflow-x-auto text-xs leading-relaxed">
								<code>{`// components/solid/SolidCounter.island.tsx
import { createSignal } from "solid-js";

export default function SolidCounter(props) {
	const [count, setCount] = createSignal(props.initial ?? 0);

	return (
		<button onClick={() => setCount((c) => c + 1)}>
			Solid: {count()}
		</button>
	);
}`}</code>
							</pre>
						</div>
					</div>

					<p className="text-base-content mb-4">
						Use it in a page with a directive — the directive controls when the
						island's JavaScript loads:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`import Counter from "../components/Counter.island.tsx";

export default function Home() {
  return (
    <div>
      <h1>My Site</h1>
      <Counter initial={5} comrade:patient />
    </div>
  );
}`}</code>
					</pre>
					<p className="text-base-content mb-2">
						Three directives: <code>comrade:visible</code> (default — on
						scroll), <code>comrade:patient</code> (on idle),{" "}
						<code>comrade:eager</code> (immediately).
					</p>
					<p className="text-sm text-base-content/80">
						<a href="/guide/components-islands" className="underline">
							Components & Islands →
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Run it */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						8. RUN IT
					</h2>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`bun run dev      # dev server at http://localhost:3000
bun run build    # production build → dist/`}</code>
					</pre>
					<p className="text-base-content">
						The dev server watches for file changes and reloads the browser
						automatically. The build produces static HTML in <code>dist/</code>{" "}
						ready to deploy anywhere.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Configuration */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						CONFIGURATION
					</h2>
					<p className="text-base-content mb-4">
						Castro works without any config file. When you need to customize
						behavior, create <code>castro.config.js</code> at your project root.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// castro.config.js
export default {
  port: 3000,
  messages: "satirical",
  plugins: [],
  importMap: {},
};`}</code>
					</pre>
					<p className="text-sm text-base-content/80 mb-8">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/config.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							config.js
						</a>
					</p>

					<div className="space-y-6">
						<div>
							<h3 className="font-mono text-xl text-secondary mb-2">port</h3>
							<p className="text-base-content">
								<code>port?: number</code> — default: <code>3000</code>. The
								port the dev server listens on.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-xl text-secondary mb-2">
								messages
							</h3>
							<p className="text-base-content">
								<code>{'messages?: "satirical" | "serious"'}</code> — default:{" "}
								<code>"satirical"</code>. Controls CLI output tone. Both contain
								the same information.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-xl text-secondary mb-2">plugins</h3>
							<p className="text-base-content">
								<code>plugins?: CastroPlugin[]</code> — default: <code>[]</code>
								. Plugins hook into the build pipeline to inject assets, run
								processors, and register custom island frameworks. See{" "}
								<a href="/guide/plugins" className="underline">
									Plugins
								</a>
								.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-xl text-secondary mb-2">
								importMap
							</h3>
							<p className="text-base-content mb-3">
								<code>{"importMap?: Record<string, string>"}</code> — default:{" "}
								<code>{"{}"}</code>. Additional entries merged into the{" "}
								<code>{'<script type="importmap">'}</code> on every island page.
								Any key is treated as external during island compilation — the
								browser loads it from CDN instead of bundling.
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`importMap: { "my-lib": "https://esm.sh/my-lib@1.0.0" }`}</code>
							</pre>
						</div>
					</div>

					<div className="mt-8">
						<p className="text-base-content mb-4">
							This website's own config — Tailwind plugin, port 3000, satirical
							messages, Preact islands:
						</p>
						<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-2">
							<code>{`import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [tailwind({ input: "styles/app.css" })],
  port: 3000,
  messages: "satirical",
};`}</code>
						</pre>
						<p className="text-sm text-base-content/80">
							→{" "}
							<a
								href="https://github.com/ViktorZhurbin/castro/blob/main/website/castro.config.js"
								target="_blank"
								rel="noopener"
								className="underline"
							>
								website/castro.config.js
							</a>
						</p>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* What's Next */}
			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						WHAT'S NEXT
					</h2>
					<div className="flex flex-wrap gap-4">
						<a
							href="/guide/components-islands"
							className="btn btn-outline btn-primary"
						>
							Components & Islands →
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
