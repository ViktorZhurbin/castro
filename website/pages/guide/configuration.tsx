import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Configuration — Castro Guide",
	layout: "docs",
	path: "/guide/configuration",
	section: "guide",
};

export default function Configuration() {
	return (
		<>
			{/* Header */}
			<section className="pt-16 pb-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						CONFIGURATION
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro works without any config file. When you need to customize
						behavior, create <code>castro.config.js</code> at your project root.
					</p>
				</div>
			</section>

			{/* Full type */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						CASTRO CONFIG
					</h2>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`// castro.config.js
export default {
  port: 3000,
  messages: "satirical",
  framework: "preact",
  plugins: [],
  importMap: {},
};`}</code>
					</pre>
					<p className="text-sm text-base-content/50">
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
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* port */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-4">
						PORT
					</h2>
					<p className="text-base-content mb-2">
						<code>port?: number</code> — default: <code>3000</code>
					</p>
					<p className="text-base-content">
						The port the dev server listens on. Has no effect on{" "}
						<code>castro build</code>.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* messages */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-4">
						MESSAGES
					</h2>
					<p className="text-base-content mb-2">
						<code>{'messages?: "satirical" | "serious"'}</code> — default:{" "}
						<code>"satirical"</code>
					</p>
					<p className="text-base-content">
						Controls the tone of CLI output. <code>"satirical"</code> uses
						communist-themed log messages. <code>"serious"</code> uses plain
						technical output. Both contain the same information.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* framework */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-4">
						FRAMEWORK
					</h2>
					<p className="text-base-content mb-2">
						<code>framework?: string</code> — default: <code>"preact"</code>
					</p>
					<p className="text-base-content mb-4">
						The default framework for islands. Castro uses this when it
						encounters an island that isn't inside a named framework directory
						(e.g. <code>components/solid/</code>).
					</p>
					<p className="text-base-content">
						Built-in options: <code>"preact"</code>, <code>"solid"</code>.
						Additional frameworks can be registered via plugins — see{" "}
						<a href="/guide/multi-framework" className="underline">
							Multi-Framework
						</a>
						.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* plugins */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-4">
						PLUGINS
					</h2>
					<p className="text-base-content mb-2">
						<code>plugins?: CastroPlugin[]</code> — default: <code>[]</code>
					</p>
					<p className="text-base-content mb-4">
						An array of plugin objects that hook into the build pipeline.
						Plugins can inject assets into every page, run PostCSS or other
						processors, register custom island frameworks, and watch extra
						directories in dev mode.
					</p>
					<p className="text-base-content">
						See{" "}
						<a href="/guide/plugins" className="underline">
							Plugins
						</a>{" "}
						for the full interface and a worked example.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* importMap */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-4">
						IMPORTMAP
					</h2>
					<p className="text-base-content mb-2">
						<code>{"importMap?: Record<string, string>"}</code> — default:{" "}
						<code>{"{}"}</code>
					</p>
					<p className="text-base-content mb-4">
						Additional entries merged into the{" "}
						<code>{'<script type="importmap">'}</code> injected into every page
						that uses islands. User entries win on conflict with framework
						defaults. Any key in the import map is automatically treated as
						external during island client compilation — Bun won't bundle it, the
						browser loads it from the CDN.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`// castro.config.js
export default {
  importMap: {
    "my-lib": "https://esm.sh/my-lib@1.0.0",
  },
};`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Real example */}
			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-primary mb-6">
						REAL EXAMPLE
					</h2>
					<p className="text-base-content mb-4">
						This website's own config — Tailwind CSS plugin, port 3000,
						satirical messages, Preact as the default island framework:
					</p>
					<pre className="bg-base-300 border-2 border-base-content/10 p-6 overflow-x-auto text-sm leading-relaxed">
						<code>{`import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [tailwind({ input: "styles/app.css" })],
  port: 3000,
  messages: "satirical",
  framework: "preact",
};`}</code>
					</pre>
					<p className="text-sm text-base-content/50 mt-4">
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
					<div className="flex flex-wrap gap-4 mt-8">
						<a
							href="/guide/quick-start"
							className="btn btn-outline btn-primary"
						>
							← Quick Start
						</a>
						<a
							href="/guide/multi-framework"
							className="btn btn-outline btn-primary"
						>
							Next: Multi-Framework →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
