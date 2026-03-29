import type { PageMeta } from "@vktrz/castro";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "3. bare-jsx Runtime — Castro",
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
						3. BARE-JSX RUNTIME
					</h1>
					<p className="text-base-content max-w-2xl">
						Castro's built-in reactive framework. No compiler, no virtual DOM,
						no third-party dependencies. This page explains how the reactive
						system works under the hood.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Reactive Model */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						1. HOW TRACKING WORKS
					</h2>

					<p className="text-base-content mb-4">
						The reactive system uses a single global variable —{" "}
						<code>listener</code> — to thread dependency tracking through signal
						reads:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`let listener = null;  // currently-running effect

function createSignal(value) {
  const subscribers = new Set();

  const getter = () => {
    if (listener) subscribers.add(listener);  // subscribe
    return value;
  };

  const setter = (next) => {
    value = next;
    for (const sub of subscribers) sub();  // notify
  };

  return [getter, setter];
}

function createEffect(fn) {
  const effect = () => {
    listener = effect;
    fn();             // run fn — any signal reads during this subscribe
    listener = null;
  };
  effect();           // run once immediately
}`}</code>
					</pre>

					<p className="text-base-content mb-4">
						The key insight:{" "}
						<strong>dependency tracking is bidirectional</strong>. Each signal
						keeps a set of subscriber effects; each effect re-reads its signals
						on every run, so subscriptions update dynamically. A signal read
						inside an <code>if</code> branch only creates a subscription when
						that branch executes.
					</p>

					<p className="text-base-content text-sm">
						See the{" "}
						<a href="/guide/using-jsx" className="underline">
							Using JSX guide
						</a>{" "}
						for the user-facing API.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* The Function Wrapper Pattern */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						2. HOW h() HANDLES PROPS
					</h2>

					<p className="text-base-content mb-4">
						JSX compiles to <code>h(type, props, ...children)</code> calls. The
						runtime classifies each prop by type and wires it up accordingly:
					</p>

					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// Simplified prop handling in createElement()
for (const [key, value] of Object.entries(props)) {
  if (key.startsWith("on")) {
    // Event handlers attached once, never re-run
    el.addEventListener(key.slice(2).toLowerCase(), value);

  } else if (typeof value === "function") {
    // Reactive prop: wrap in an effect, update DOM on change
    createEffect(() => setAttribute(el, key, value()));

  } else {
    // Static value: set once
    setAttribute(el, key, value);
  }
}

// Reactive children use a placeholder comment node
function bindReactiveChild(parent, fn) {
  let current = document.createComment("");
  parent.appendChild(current);
  createEffect(() => {
    const node = toNode(fn());  // call fn, get new DOM node
    current.replaceWith(node);
    current = node;             // track current node for next update
  });
}`}</code>
					</pre>

					<p className="text-base-content mb-4">
						This is why reactive values need function wrappers — without a
						function, the value is read once at creation and the runtime has no
						way to re-read it. Solid's compiler generates these wrappers
						automatically.{" "}
						<a
							href="https://github.com/ViktorZhurbin/castro/blob/main/castro/runtime/jsx/dom/index.js"
							className="underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							View source →
						</a>
					</p>

					<p className="text-base-content text-sm">
						<a href="/guide/using-jsx" className="underline">
							The guide covers when and how to apply the function wrapper
							pattern →
						</a>
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* Hydration */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						3. HYDRATION STRATEGY
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
						4. KNOWN LIMITATIONS
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
						5. COMPARED TO OTHER FRAMEWORKS
					</h2>

					<div className="overflow-x-auto">
						<table className="table">
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
									<td>Bundle size</td>
									<td>~2KB</td>
									<td>~18KB</td>
									<td>~9KB</td>
								</tr>
								<tr>
									<td>Specifics</td>
									<td>Signals, explicit wiring</td>
									<td>Signals, compiler abstracts wiring</td>
									<td>Hooks, just re-render</td>
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
