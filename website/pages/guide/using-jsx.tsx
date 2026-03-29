import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "Using JSX — Castro Guide",
	layout: "docs",
	path: "/guide/using-jsx",
	section: "guide",
};

export default function UsingJsx() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						USING JSX
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro ships with JSX support out of the box. Write component
						islands with plain JSX syntax, pick your reactivity model (bare-jsx,
						Preact, or Solid), and don't worry about configuration.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* JSX Basics */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						JSX OUT OF THE BOX
					</h2>
					<p className="text-base-content mb-4">
						You can write regular JSX without any additional setup.
						<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
							<code>{`// MyComponent.tsx
							export function MyComponent() {

  return (
    <div>Some exmaple</div>
  );
}

import { MyComponent } from "../components/MyComponent.tsx

export function OtherComponent() {
  return <MyComponent />
}
`}</code>
						</pre>
					</p>
					<p className="text-base-content mb-4">
						Island components are JSX files with `.island` suffix. Write regular
						JSX and import whatever reactive primitives your framework provides.
					</p>

					<div className="tabs tabs-border mb-6">
						<input
							type="radio"
							name="jsx-frameworks"
							className="tab font-display"
							aria-label="bare-jsx"
							defaultChecked
						/>
						<div className="tab-content pt-4">
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`import { createSignal } from "@vktrz/castro/signals";

export default function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {() => count()}
    </button>
  );
}`}</code>
							</pre>
						</div>

						<input
							type="radio"
							name="jsx-frameworks"
							className="tab font-display"
							aria-label="Preact"
						/>
						<div className="tab-content pt-4">
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`import { useState } from "preact/hooks";

export default function Counter() {
  const [count, setCount] = useState(0);

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
							name="jsx-frameworks"
							className="tab font-display"
							aria-label="Solid"
						/>
						<div className="tab-content pt-4">
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {count()}
    </button>
  );
}`}</code>
							</pre>
						</div>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Framework Selection */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						CHOOSING A FRAMEWORK
					</h2>

					<div className="overflow-x-auto mb-6">
						<table className="table">
							<thead>
								<tr>
									<th>Framework</th>
									<th>Best For</th>
									<th>Bundle size</th>
									<th>Trade-off</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>bare-jsx</code>
									</td>
									<td>Simple widgets, learning how reactivity works</td>
									<td>~2KB</td>
									<td>No effect cleanup, fragments in conditionals break</td>
								</tr>
								<tr>
									<td>
										<code>preact</code>
									</td>
									<td>Complex hierarchies, familiar React API</td>
									<td>~9KB from CDN</td>
									<td>Slightly larger bundle</td>
								</tr>
								<tr>
									<td>
										<code>solid</code>
									</td>
									<td>Fine-grained reactivity with clean syntax</td>
									<td>~18KB from CDN</td>
									<td>Larger bundle, different mental model</td>
								</tr>
							</tbody>
						</table>
					</div>

					<p className="text-base-content mb-4">
						Change framework <strong>per island</strong>, not globally. Use
						bare-jsx for a button, Preact for a form, Solid for a complex
						dashboard—all on the same page.
					</p>

					<div>
						<p className="text-sm font-bold text-base-content mb-2">
							Set default framework in config:
						</p>
						<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
							<code>{`// castro.config.js
export default {
  framework: "preact",  // or "solid" or "bare-jsx"
};`}</code>
						</pre>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* bare-jsx Specifics */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						BARE-JSX: THE FUNCTION WRAPPER PATTERN
					</h2>

					<p className="text-base-content mb-4">
						bare-jsx has one quirk: reactive values must be wrapped in
						functions. This is how the runtime knows something should update
						when a signal changes.
					</p>

					<div className="space-y-4 mb-6">
						<div>
							<p className="text-sm font-bold text-error mb-2">
								❌ Won't update (value is fixed)
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`const [count, setCount] = createSignal(0);
return <div>Count: {count()}</div>;`}</code>
							</pre>
						</div>

						<div>
							<p className="text-sm font-bold text-success mb-2">
								✓ Updates reactively (wrapped in function)
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-4 overflow-x-auto text-xs leading-relaxed">
								<code>{`const [count, setCount] = createSignal(0);
return <div>Count: {() => count()}</div>;`}</code>
							</pre>
						</div>
					</div>

					<p className="text-base-content text-sm mb-4">
						The runtime intercepts functions in JSX and wraps them in effects.
						When a signal inside the function changes, the effect re-runs and
						the DOM updates. This is how Solid's compiler generates code
						automatically —bare-jsx just makes you write it explicitly.
					</p>

					<p className="text-sm text-base-content/70 mb-4">
						<a href="/how-it-works/bare-jsx" className="underline">
							Learn the technical details →
						</a>
					</p>

					<Note>
						This applies to children, attributes, and event handlers. Example:
						<code className="block mt-2 bg-base-200 p-2 rounded text-xs">
							{`class={() => isActive() ? "active" : ""}`}
						</code>
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Runtime Exports */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						SIGNALS & IMPORTS
					</h2>

					<p className="text-base-content mb-4">
						bare-jsx exports minimal reactive primitives:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// Always import from this path
import { createSignal, createEffect } from "@vktrz/castro/signals";

// createSignal(initialValue)
// Returns [getter, setter]
const [count, setCount] = createSignal(0);
console.log(count());      // Read: 0
setCount(count() + 1);     // Write: 1

// createEffect(fn)
// Auto-tracks signal reads, re-runs on dependencies change
createEffect(() => {
  console.log("Count is now:", count());
});`}</code>
					</pre>

					<p className="text-base-content text-sm">
						That's it—no hooks, no memo, no cleanup functions. Preact and Solid
						have richer APIs; check their docs for those frameworks.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Caveats */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						BARE-JSX CAVEATS
					</h2>

					<p className="text-base-content mb-6">
						bare-jsx is minimal by design. A few things to know:
					</p>

					<div className="space-y-4">
						{/* Fragments in conditionals */}
						<div>
							<h3 className="font-bold text-base-content mb-2">
								Fragments Don't Work in Conditionals
							</h3>
							<p className="text-sm text-base-content/80 mb-2">
								Conditional rendering that returns a Fragment will break on
								updates:
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-3 overflow-x-auto text-xs leading-relaxed mb-2">
								<code>{`// ❌ BREAKS on condition change
{() => show ? <>
  <div>A</div>
  <div>B</div>
</> : <div>Hidden</div>}

// ✓ WORKS (wrap in single root)
{() => show ? <div>
  <div>A</div>
  <div>B</div>
</div> : <div>Hidden</div>}`}</code>
							</pre>
							<p className="text-xs text-base-content/70">
								Always return a single root element from reactive conditionals.
							</p>
						</div>

						{/* Effect cleanup */}
						<div>
							<h3 className="font-bold text-base-content mb-2">
								No Effect Cleanup
							</h3>
							<p className="text-sm text-base-content/80 mb-2">
								Effects run forever—no cleanup mechanism. Keep side effects
								(timers, listeners) at module scope:
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-3 overflow-x-auto text-xs leading-relaxed">
								<code>{`// Module scope (runs once when component loads)
setInterval(() => {
  console.log(count());
}, 1000);

export default function MyIsland() {
  const [count, setCount] = createSignal(0);
  // ...
}`}</code>
							</pre>
						</div>

						{/* No context */}
						<div>
							<h3 className="font-bold text-base-content mb-2">
								No Context or Provider
							</h3>
							<p className="text-sm text-base-content/80">
								Use module-level signals for shared state. Not as flexible as
								React Context, but fine for small islands.
							</p>
						</div>
					</div>

					<p className="text-xs text-base-content/70 mt-6">
						<a href="/how-it-works/bare-jsx" className="underline">
							More technical details about limitations →
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* When to Switch Frameworks */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						WHEN TO SWITCH FRAMEWORKS
					</h2>

					<p className="text-base-content mb-4">
						If bare-jsx feels limiting, switch to Preact or Solid for that
						island:
					</p>

					<ul className="list-inside list-disc text-base-content space-y-2 mb-6">
						<li>
							<strong>Complex component hierarchies:</strong> Use Preact
							(familiar React API)
						</li>
						<li>
							<strong>Need effect cleanup or Context:</strong> Use Preact or
							Solid
						</li>
						<li>
							<strong>
								Want fine-grained reactivity without function wrappers:
							</strong>{" "}
							Use Solid
						</li>
						<li>
							<strong>Bundle size critical:</strong> Use bare-jsx (smallest)
						</li>
					</ul>

					<Note>
						Mix frameworks on the same page. A button can be bare-jsx, a form
						can be Preact, a dashboard can be Solid. No coordination needed—each
						island hydrates independently.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a href="/guide/directives" className="btn btn-outline btn-primary">
							← Directives
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
