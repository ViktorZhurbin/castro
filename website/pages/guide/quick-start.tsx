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
			<section className="pt-16 pb-10 px-6 bg-base-100">
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
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						1. PREREQUISITES
					</h2>
					<p className="text-base-content mb-4">
						Castro requires{" "}
						<a
							href="https://bun.sh"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							Bun
						</a>{" "}
						1.3.8 or later. It uses Bun's native bundler, module loader, and
						file APIs throughout the build pipeline.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`curl -fsSL https://bun.sh/install | bash`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Install */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
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
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						3. PROJECT STRUCTURE
					</h2>
					<p className="text-base-content mb-6">
						Castro follows a convention-over-configuration structure. There is no
						required config file — create the directories and start building.
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
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
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
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						5. CREATE A PAGE
					</h2>
					<p className="text-base-content mb-4">
						Pages live in <code>pages/</code>. Both{" "}
						<code>.tsx</code> and <code>.md</code> files are supported.
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

			{/* Add an island */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						6. ADD AN ISLAND
					</h2>
					<p className="text-base-content mb-4">
						Any component named <code>*.island.tsx</code> is treated as an
						island — compiled separately for both SSR and the browser.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
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
					<Note className="mb-6">
						Islands must use a default export. Named exports are ignored — the
						compiler reads only <code>module.default</code> for both SSR and
						client hydration.
					</Note>
					<p className="text-base-content mb-4">
						Use it in a page with a hydration directive:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`import Counter from "../components/Counter.island.tsx";

export default function Home() {
  return (
    <div>
      <h1>My Site</h1>
      <Counter initial={5} comrade:visible />
    </div>
  );
}`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Directives */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						7. DIRECTIVES
					</h2>
					<p className="text-base-content mb-6">
						Every island prop ending in a directive controls when the island
						hydrates. Three are available:
					</p>
					<ul className="space-y-3 mb-6">
						<li className="flex gap-3 items-start">
							<code className="badge badge-secondary shrink-0 mt-0.5">
								comrade:visible
							</code>
							<span className="text-base-content">
								Hydrate when the island scrolls into view (default — used when
								no directive is specified).
							</span>
						</li>
						<li className="flex gap-3 items-start">
							<code className="badge badge-primary shrink-0 mt-0.5">
								lenin:awake
							</code>
							<span className="text-base-content">
								Hydrate immediately on page load.
							</span>
						</li>
						<li className="flex gap-3 items-start">
							<code className="badge badge-neutral shrink-0 mt-0.5">
								no:pasaran
							</code>
							<span className="text-base-content">
								Render at build time only. Zero JavaScript shipped to the
								browser.
							</span>
						</li>
					</ul>
					<p className="text-sm text-base-content/60">
						See{" "}
						<a
							href="/how-it-works/hydration"
							className="underline"
						>
							Hydration
						</a>{" "}
						for a deep-dive on how each directive works at runtime.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Run it */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
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

			{/* What's Next */}
			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						WHAT'S NEXT
					</h2>
					<div className="flex flex-wrap gap-4">
						<a href="/guide/configuration" className="btn btn-outline btn-primary">
							Configuration →
						</a>
						<a href="/guide/multi-framework" className="btn btn-outline btn-primary">
							Multi-Framework →
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
