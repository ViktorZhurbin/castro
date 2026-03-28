import type { PageMeta } from "@vktrz/castro";
import Redactor from "../../components/bare-jsx/Redactor.island.tsx";
import { Note } from "../../components/Note.tsx";
import PropagandaRadio from "../../components/PropagandaRadio.island.tsx";
import FiveYearPlan from "../../components/solid/FiveYearPlan.island.tsx";

export const meta: PageMeta = {
	title: "Multi-Framework — Castro Guide",
	layout: "docs",
	path: "/guide/multi-framework",
	section: "guide",
};

export default function MultiFramework() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						MULTI-FRAMEWORK
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro supports Preact and Solid out of the box. Both can appear on
						the same page. You can add more frameworks via plugins.
					</p>
				</div>
			</section>

			{/* Directory convention */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						1. DIRECTORY CONVENTION
					</h2>
					<p className="text-base-content mb-6">
						Castro detects a non-default framework when an island file lives
						inside a directory named after a registered framework ID. The
						directory can appear anywhere in your project:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`components/
├── Counter.island.tsx          ← uses default framework (preact)
└── solid/
    └── SolidCounter.island.tsx ← detected as Solid by directory name`}</code>
					</pre>
					<Note>
						The framework directory name must match the framework's{" "}
						<code>id</code> exactly (e.g. <code>solid/</code> for{" "}
						<code>id: "solid"</code>).
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Using both on a page */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						2. USING BOTH ON A PAGE
					</h2>
					<p className="text-base-content mb-6">
						Import and use islands from different frameworks exactly the same
						way. Castro handles the separate compilation and hydration
						automatically:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`import Counter from "../components/Counter.island.tsx";
import SolidCounter from "../components/solid/SolidCounter.island.tsx";

export default function Page() {
  return (
    <div>
      <Counter initial={5} comrade:visible />
      <SolidCounter initial={10} comrade:visible />
    </div>
  );
}`}</code>
					</pre>
					<Note>
						Each island bundles its own framework import. Preact and Solid load
						independently from their CDN entries in the import map — they don't
						interfere with each other.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Live demo */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						3. LIVE DEMO: THREE FRAMEWORKS, ONE PAGE
					</h2>
					<p className="text-base-content mb-8">
						Three islands below, three different frameworks. Castro handles the
						separate compilation and import maps automatically. Open DevTools
						Network to see Preact, bare-jsx runtime, and Solid load
						independently.
					</p>

					<div className="space-y-6">
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

						<div className="card card-border border-accent bg-base-100">
							<div className="card-body">
								<h3 className="card-title font-display text-2xl text-accent">
									BARE-JSX
								</h3>
								<p className="text-sm text-base-content/80">
									Castro's own runtime. Signals + direct DOM, no virtual DOM, no
									CDN.
								</p>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<Redactor />
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
									DOM.
								</p>
								<div className="bg-base-200 p-4 border border-dashed border-base-300">
									<FiveYearPlan />
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
						4. WHAT HAPPENS UNDER THE HOOD
					</h2>
					<ul className="space-y-3 text-base-content">
						<li>
							<strong>Discovery</strong> — the registry checks each island's
							file path against known framework directories to resolve its
							framework ID.
						</li>
						<li>
							<strong>Config loading</strong> —{" "}
							<code>loadFrameworkConfig(id)</code> loads and caches the config
							before any rendering starts.
						</li>
						<li>
							<strong>SSR</strong> — <code>renderMarker()</code> calls the
							cached <code>renderSSR()</code> for that framework. Both Preact
							and Solid produce static HTML, wrapped in the same{" "}
							<code>{"<castro-island>"}</code> element.
						</li>
						<li>
							<strong>Client hydration</strong> — each island's client bundle
							calls its own framework's <code>hydrate()</code>.
						</li>
					</ul>
					<p className="text-base-content text-sm mt-4">
						For more on how islands compile and hydrate, see{" "}
						<a href="/how-it-works" className="underline">
							The Build Pipeline
						</a>{" "}
						and{" "}
						<a href="/how-it-works/hydration" className="underline">
							Hydration
						</a>
						.
					</p>
					<p className="text-sm text-base-content/50 mt-2">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworkConfig.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							frameworkConfig.js
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworks/preact.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							frameworks/preact.js
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworks/solid.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							frameworks/solid.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* FrameworkConfig interface */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						5. THE FrameworkConfig INTERFACE
					</h2>
					<p className="text-base-content mb-6">
						To add a framework (via plugin or a built-in file in{" "}
						<code>frameworks/</code>), you implement this interface:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`type FrameworkConfig = {
  /** Framework identifier — also the directory name Castro looks for */
  id: string;

  /** Bun.build config for compiling islands (SSR and client) */
  getBuildConfig: (target?: "ssr") => Partial<Bun.BuildConfig>;

  /** CDN import map entries added to every page using this framework */
  importMap: Record<string, string>;

  /**
   * Assets injected into <head> for pages using this framework.
   * E.g. Solid's hydration coordination script.
   */
  headAssets?: Asset[];

  /**
   * Client-side hydration code string, injected into the island bundle.
   * Has access to: Component, props, container at runtime.
   */
  hydrateFnString: string;

  /** Server-side render function, called at build time */
  renderSSR: (Component: Function, props: Record<string, unknown>) => string;
};`}</code>
					</pre>
					<p className="text-sm text-base-content/50">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworks/types.d.ts"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							frameworks/types.d.ts
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Adding a new framework */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						6. ADDING A NEW FRAMEWORK
					</h2>
					<p className="text-base-content mb-4">
						Register a custom framework by providing a{" "}
						<code>frameworkConfig</code> on your plugin:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// castro.config.js
import { myFrameworkPlugin } from "./my-framework-plugin.js";

export default {
  plugins: [myFrameworkPlugin()],
};

// my-framework-plugin.js
export function myFrameworkPlugin() {
  return {
    name: "my-framework",
    frameworkConfig: {
      id: "my-framework",
      getBuildConfig: (target) => ({ /* Bun.build options */ }),
      importMap: {
        "my-framework": "https://esm.sh/my-framework",
      },
      hydrateFnString: \`
        const { hydrate, h } = await import("my-framework");
        hydrate(h(Component, props), container);
      \`,
      renderSSR: (Component, props) => {
        // Return an HTML string
        return renderToString(Component(props));
      },
    },
  };
}`}</code>
					</pre>
					<p className="text-base-content">
						Islands inside a <code>components/my-framework/</code> directory
						will automatically use this config. Islands elsewhere still use the
						default framework from <code>castro.config.js</code>.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a href="/guide/directives" className="btn btn-outline btn-primary">
							← Directives
						</a>
						<a href="/guide/plugins" className="btn btn-outline btn-primary">
							Next: Plugins →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
