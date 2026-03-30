import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
	title: "Plugins — Castro Guide",
	layout: "docs",
	path: "/guide/plugins",
	section: "guide",
};

export default function Plugins() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						PLUGINS
					</h1>
					<p className="text-base-content max-w-2xl">
						Plugins hook into Castro's build pipeline to inject assets, process
						files, and register new island frameworks.
					</p>
				</div>
			</section>

			{/* CastroPlugin interface */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						1. THE CastroPlugin INTERFACE
					</h2>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`type CastroPlugin = {
  name: string;
  getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
  onPageBuild?: () => Promise<void>;
  watchDirs?: string[];
  frameworkConfig?: FrameworkConfig;
};`}</code>
					</pre>

					<div className="space-y-6">
						<div>
							<h3 className="font-mono text-lg text-secondary mb-2">name</h3>
							<p className="text-base-content">
								Required. A unique identifier for the plugin, used in error
								messages.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-lg text-secondary mb-2">
								getPageAssets
							</h3>
							<p className="text-base-content mb-2">
								Called once per page render. Returns an array of{" "}
								<code>Asset</code> objects to inject into the page's{" "}
								<code>{"<head>"}</code>. Receives <code>hasIslands</code> so
								plugins can conditionally inject assets only on pages that use
								islands — see{" "}
								<a href="/how-it-works/hydration" className="underline">
									Hydration
								</a>{" "}
								for how Castro decides which pages need client JS.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-lg text-secondary mb-2">
								onPageBuild
							</h3>
							<p className="text-base-content">
								Called before pages are built. In dev mode, runs on every file
								change (page, layout, or component). Use this for preprocessing
								steps like compiling CSS, copying static assets, or generating
								data files.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-lg text-secondary mb-2">
								watchDirs
							</h3>
							<p className="text-base-content">
								An array of directories (relative to project root) to watch in
								dev mode. When any file in a watched directory changes,{" "}
								<code>onPageBuild()</code> is called and the browser reloads.
							</p>
						</div>

						<div>
							<h3 className="font-mono text-lg text-secondary mb-2">
								frameworkConfig
							</h3>
							<p className="text-base-content">
								Registers a custom island framework. See{" "}
								<a href="/guide/components-islands" className="underline">
									Components & Islands
								</a>{" "}
								for the full <code>FrameworkConfig</code> interface.
							</p>
						</div>
					</div>

					<p className="text-sm text-base-content/80 mt-6">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/plugins.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							plugins.js
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/src/types.d.ts"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							types.d.ts
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Using a plugin */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						2. USING A PLUGIN
					</h2>
					<p className="text-base-content mb-4">
						Add plugins to the <code>plugins</code> array in{" "}
						<code>castro.config.js</code>:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [tailwind({ input: "styles/app.css" })],
};`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Tailwind plugin walkthrough */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						3. FULL EXAMPLE: TAILWIND PLUGIN
					</h2>
					<p className="text-base-content mb-6">
						The official Tailwind plugin (<code>@vktrz/castro-tailwind</code>)
						is the canonical example of what a plugin can do. Here is the full
						source, annotated:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-4">
						<code>{`import { basename, dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

export function tailwind({ input }) {
  const inputs = Array.isArray(input) ? input : [input];

  // Single processor — @tailwindcss/postcss handles incremental rebuilds
  // internally via an LRU cache keyed on file path + mtime.
  const processor = postcss([tailwindcss()]);

  return {
    name: "castro-tailwind",

    // Tell the dev server to watch the CSS source directories.
    // Changes trigger onPageBuild() + browser reload.
    watchDirs: [...new Set(inputs.map((file) => dirname(file) || "."))],

    async onPageBuild() {
      // Process each input file through PostCSS + Tailwind,
      // then write the compiled CSS to dist/.
      for (const file of inputs) {
        const source = await Bun.file(file).text();
        const result = await processor.process(source, { from: file });
        await Bun.write(join("dist", basename(file)), result.css);
      }
    },

    getPageAssets() {
      // Inject a <link> tag for each compiled CSS file.
      return inputs.map((file) => ({
        tag: "link",
        attrs: { rel: "stylesheet", href: \`/\${basename(file)}\` },
      }));
    },
  };
}`}</code>
					</pre>
					<p className="text-sm text-base-content/80">
						→{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/plugins/tailwind/index.js"
							target="_blank"
							rel="noopener"
							className="underline"
						>
							plugins/tailwind/index.js
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* The Asset type */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						4. THE Asset TYPE
					</h2>
					<p className="text-base-content mb-4">
						<code>getPageAssets()</code> returns <code>Asset[]</code>. An asset
						is either a raw HTML string or a structured tag definition:
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`type Asset =
  | string
  | {
      tag: string;
      attrs?: Record<string, string | boolean>;
      content?: string;
    };`}</code>
					</pre>
					<p className="text-base-content mb-4">Examples:</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`// Structured tag: produces <link rel="stylesheet" href="/app.css">
{ tag: "link", attrs: { rel: "stylesheet", href: "/app.css" } }

// Structured tag with content: produces <script>...</script>
{ tag: "script", content: "console.log('hello')" }

// Inline style: produces <style>...</style>
{ tag: "style", content: ":root { --brand: red }" }

// Boolean attr: produces <script type="module" defer src="/app.js">
{ tag: "script", attrs: { type: "module", defer: true, src: "/app.js" } }

// Raw string: injected as-is (useful for frameworks like Solid
// that provide their own generateHydrationScript())
"<script>/* raw hydration script */</script>"`}</code>
					</pre>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a
							href="/guide/components-islands"
							className="btn btn-outline btn-primary"
						>
							← Components & Islands
						</a>
						<a
							href="/how-it-works/castro-jsx"
							className="btn btn-outline btn-primary"
						>
							castro-jsx Framework →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
