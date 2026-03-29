import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "bare-jsx Framework — Castro Tutorial",
	layout: "docs",
	path: "/how-it-works/bare-jsx",
	section: "how-it-works",
};

export default function BareJsxPage() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						BARE-JSX FRAMEWORK
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro's built-in reactive framework. No compiler, no virtual DOM,
						no third-party dependencies. See what Solid's compiler
						generates—bare-jsx makes you write it explicitly.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Reactive Model */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						1. THE REACTIVE MODEL
					</h2>

					<p className="text-base-content mb-4">
						bare-jsx shifts from component-centric (React) to signal-centric
						(fine-grained) reactivity.
					</p>

					<ul className="list-inside list-disc text-base-content space-y-3 mb-6">
						<li>
							<code>createSignal(value)</code> — mutable, tracked state. Returns
							getter and setter functions. Changes don't trigger re-renders;
							they trigger effects.
						</li>
						<li>
							<code>createEffect(fn)</code> — subscribes to all signals read
							inside. Re-runs whenever any dependency changes. No explicit
							dependencies list—tracking is automatic.
						</li>
						<li>
							<strong>No virtual DOM:</strong> Component functions run once.
							Effects update specific DOM nodes (text, attributes, children).
						</li>
						<li>
							<strong>Fine-grained updates:</strong> If a signal changes, only
							the parts of the DOM that depend on it re-render.
						</li>
					</ul>

					<div className="bg-base-200 border-l-4 border-primary p-4 mb-6">
						<p className="text-sm text-base-content">
							<strong>Comparison:</strong> React re-renders the entire component
							tree on state change. bare-jsx uses effects to surgically update
							specific DOM nodes. Solid works the same way, but uses a compiler
							to generate the effects automatically—bare-jsx makes you write
							them via function wrappers.
						</p>
					</div>

					<p className="text-base-content text-sm">
						Read more in the guide:{" "}
						<a href="/guide/using-jsx" className="underline">
							Using JSX
						</a>
						.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* The Function Wrapper Pattern */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						2. THE FUNCTION WRAPPER PATTERN
					</h2>

					<p className="text-base-content mb-4">
						In React, component functions are called on every state change. In
						bare-jsx, component functions run <strong>once</strong>. To make a
						value reactive, wrap it in a function:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`const [count, setCount] = createSignal(0);

// WRONG: Evaluated once at component creation
return <div>{count()}</div>;

// RIGHT: Function = the runtime wraps it in an effect
return <div>{() => count()}</div>;`}</code>
					</pre>

					<p className="text-base-content mb-4">
						When the runtime sees a function in JSX, it:
					</p>

					<ol className="list-inside list-decimal text-base-content space-y-2 mb-6">
						<li>
							Checks if it's an event handler (name starts with "on") →{" "}
							<code>addEventListener()</code>
						</li>
						<li>
							Otherwise, wraps it in <code>createEffect()</code> → when signal
							dependencies change, the function re-runs and the DOM updates
						</li>
					</ol>

					<p className="text-base-content mb-4">This applies to:</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed">
						<code>{`{/* Text children */}
<div>{() => count()}</div>

{/* Attributes */}
<div class={() => active() ? "active" : ""} />

{/* Conditionals (reactive) */}
{() => show() ? <div>Visible</div> : null}

{/* Event handlers (NOT wrapped in effects, just listeners) */}
<button onClick={() => setCount(count() + 1)}>Click</button>`}</code>
					</pre>

					<Note>
						This is not magic. The runtime's <code>createElement()</code>{" "}
						function simply checks the type of each prop and attribute value. If
						it's a function, it wraps it in an effect. This is what Solid's
						compiler generates automatically. See
						<a href="/castro/runtime/jsx/dom/index.js" className="underline">
							{" "}
							the source
						</a>
						.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Signals API */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						3. SIGNALS API
					</h2>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`import { createSignal, createEffect } from "@vktrz/castro/signals";

// createSignal(initialValue): [getter, setter]
const [count, setCount] = createSignal(0);
console.log(count());        // 0 (call getter)
setCount(1);                 // Call setter (triggers effects)
console.log(count());        // 1

// createEffect(fn)
// Auto-tracks all signal reads, re-runs on changes
createEffect(() => {
  console.log("Count:", count());
  // Subscribes to count(). If it changes, this re-runs.
});

// Effect runs on creation, then whenever a dependency changes
// Output: "Count: 0" on creation
//         "Count: 1" after setCount(1)`}</code>
					</pre>

					<p className="text-base-content text-sm mb-4">
						That's the entire public API. No hooks, no memo, no cleanup
						functions. Simplicity by design.
					</p>

					<p className="text-base-content text-sm">
						Complex state management? Use multiple signals or create a custom
						hook-like function that returns signals. Context? Use module-level
						signals for shared state (coarse but functional for islands).
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Hydration */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						4. HYDRATION STRATEGY
					</h2>

					<p className="text-base-content mb-4">
						bare-jsx uses <strong>clear-and-remount</strong> hydration. The SSR
						HTML is discarded, and the component re-runs client-side to build a
						reactive DOM tree.
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// SSR (build time)
export default function Counter() {
  const [count, setCount] = createSignal(0);
  return <div>Count: {() => count()}</div>;
}
// Produces: <div>Count: 0</div>

// Hydration (client)
container.innerHTML = "";  // DISCARD SSR HTML
const dom = Component(props);
container.appendChild(dom);  // Mount fresh reactive tree`}</code>
					</pre>

					<p className="text-base-content mb-4">
						<strong>Why:</strong> React/Preact walk the existing DOM and attach
						listeners. bare-jsx discards it and rebuilds. This is simpler code
						(no diffing) but causes a brief visual flicker for complex islands.
					</p>

					<p className="text-base-content text-sm mb-4">
						<strong>Impact:</strong> Imperceptible for buttons/counters.
						Noticeable for large islands. If hydration flicker bothers you, use
						Preact (DOM-walking) or Solid (compiler-driven).
					</p>

					<Note>
						This is a tradeoff. The entire bare-jsx runtime is ~2KB. Supporting
						DOM-walking hydration (like React) would require a diffing
						algorithm, adding 1-2KB.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Limitations */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						5. KNOWN LIMITATIONS
					</h2>

					<div className="space-y-6">
						{/* Effect Disposal */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								No Effect Disposal
							</h3>
							<p className="text-base-content/80 mb-3">
								Effects never clean up. Once subscribed, they stay subscribed
								for the lifetime of the component.
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-3 overflow-x-auto text-xs leading-relaxed mb-3">
								<code>{`createEffect(() => {
  const id = setInterval(() => {
    console.log(count());
  }, 1000);
  // No cleanup. setInterval runs forever.
});`}</code>
							</pre>
							<p className="text-sm text-base-content/70">
								For small islands, use module-scope effects. For complex
								scenarios, switch to Solid (has <code>onCleanup()</code>) or
								Preact.
							</p>
						</div>

						{/* Batching */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								No Batching
							</h3>
							<p className="text-base-content/80 mb-3">
								Signal writes trigger effects immediately. Multiple writes cause
								cascading updates.
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-3 overflow-x-auto text-xs leading-relaxed mb-3">
								<code>{`setA(1);  // Effects run
setB(2);  // Effects run again
// React would batch these into one update`}</code>
							</pre>
							<p className="text-sm text-base-content/70">
								Rarely a problem for islands. If it is, use Solid (batches by
								default).
							</p>
						</div>

						{/* Fragments in conditionals */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								Fragments Don't Work with Reactive Conditionals
							</h3>
							<p className="text-base-content/80 mb-3">
								Reactive children that return Fragments break on updates.
							</p>
							<pre className="bg-base-200 border-2 border-base-300 p-3 overflow-x-auto text-xs leading-relaxed mb-3">
								<code>{`// ❌ BREAKS
{() => condition ? <>
  <div>A</div>
  <div>B</div>
</> : <div>C</div>}

// ✓ WORKS
{() => condition ? <div>
  <div>A</div>
  <div>B</div>
</div> : <div>C</div>}`}</code>
							</pre>
							<p className="text-sm text-base-content/70">
								Why: On update, the runtime calls <code>replaceWith()</code> on
								the old node. Fragments are special—they transfer children to
								the parent, so there's nothing to replace. Always return a
								single root from reactive conditionals.
							</p>
						</div>

						{/* No Context */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								No Context or Provider
							</h3>
							<p className="text-base-content/80 mb-3">
								No way to pass data through component trees. Use module-level
								signals.
							</p>
						</div>

						{/* No Error Boundaries */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								No Error Boundaries
							</h3>
							<p className="text-base-content/80 mb-3">
								Thrown errors propagate uncaught. No error boundary equivalent.
							</p>
						</div>

						{/* No Refs */}
						<div>
							<h3 className="font-bold text-lg text-base-content mb-2">
								No Refs or Imperative DOM Access
							</h3>
							<p className="text-base-content/80 mb-3">
								No <code>useRef</code> or <code>ref</code> attribute. Stick to
								reactive patterns.
							</p>
						</div>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Comparison */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						6. BARE-JSX VS SOLID VS PREACT
					</h2>

					<div className="overflow-x-auto">
						<table className="table text-sm">
							<thead>
								<tr>
									<th>Feature</th>
									<th>bare-jsx</th>
									<th>Solid</th>
									<th>Preact</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Reactive model</td>
									<td>Fine-grained (signals)</td>
									<td>Fine-grained (signals)</td>
									<td>Component-based (hooks)</td>
								</tr>
								<tr>
									<td>Manual function wrappers</td>
									<td>Yes ✓</td>
									<td>No (compiled)</td>
									<td>No</td>
								</tr>
								<tr>
									<td>Batching</td>
									<td>❌ No</td>
									<td>✓ Yes</td>
									<td>✓ Yes</td>
								</tr>
								<tr>
									<td>Effect cleanup</td>
									<td>❌ No</td>
									<td>✓ onCleanup()</td>
									<td>✓ return fn</td>
								</tr>
								<tr>
									<td>Hydration</td>
									<td>Clear-remount</td>
									<td>Compiled markers</td>
									<td>DOM-walking</td>
								</tr>
								<tr>
									<td>Bundle size</td>
									<td>~2KB</td>
									<td>~18KB</td>
									<td>~9KB</td>
								</tr>
								<tr>
									<td>Learning curve</td>
									<td>Shows how effects work</td>
									<td>Clean syntax, solid mental model</td>
									<td>Familiar React API</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a href="/how-it-works" className="btn btn-outline btn-primary">
							← Build Pipeline
						</a>
						<a
							href="/how-it-works/hydration"
							className="btn btn-outline btn-primary"
						>
							Hydration →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
