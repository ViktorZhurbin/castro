import type { PageMeta } from "@vktrz/castro";
import FiveYearPlan from "../../components/bare-jsx/FiveYearPlan.island.tsx";
import PropagandaRadio from "../../components/bare-jsx/PropagandaRadio.island.tsx";
import Redactor from "../../components/bare-jsx/Redactor.island.tsx";
import { Note } from "../../components/Note.tsx";

export const meta: PageMeta = {
	title: "Client Directives — Castro Guide",
	layout: "docs",
	path: "/guide/directives",
	section: "guide",
};

export default function Directives() {
	return (
		<>
			{/* Header */}
			<section className="py-12 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h1 className="font-display text-5xl md:text-7xl text-primary mb-4">
						CLIENT DIRECTIVES
					</h1>
					<p className="text-base-content max-w-2xl">
						Directives control <em>when</em> an island's JavaScript loads and
						hydrates. Every island gets server-rendered HTML at build time — the
						directive only affects the client-side behavior. Open DevTools
						Network tab to see each strategy in action.
					</p>
				</div>
			</section>

			{/* Choosing a directive */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						CHOOSING A DIRECTIVE
					</h2>
					<div className="overflow-x-auto">
						<table className="table">
							<thead>
								<tr>
									<th>Directive</th>
									<th>When JS loads</th>
									<th>Best for</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>comrade:eager</code>
									</td>
									<td>Immediately on page load</td>
									<td>Navigation, search, auto-play, analytics</td>
								</tr>
								<tr>
									<td>
										<code>comrade:patient</code>
									</td>
									<td>When browser is idle</td>
									<td>Secondary controls, toggles, non-critical UI</td>
								</tr>
								<tr>
									<td>
										<code>comrade:visible</code> (default)
									</td>
									<td>When scrolled into view</td>
									<td>Most islands</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Note className="mt-6">
						If you don't need client-side interactivity at all, don't make it an
						island — use a regular <code>.tsx</code> component instead. It will
						be server-rendered with zero JavaScript shipped.
					</Note>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:eager */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						COMRADE:EAGER
					</h2>
					<p className="text-base-content/60 italic mb-4">
						"Some comrades wait. This one doesn't."
					</p>
					<p className="text-base-content mb-4">
						Hydrates immediately on page load. The island's JavaScript is
						fetched and executed as soon as the <code>{"<castro-island>"}</code>{" "}
						element connects to the DOM — no waiting for scroll position, idle
						time, or user interaction.
					</p>
					<p className="text-base-content mb-4">
						Use this for content that must be interactive from the start:
						navigation menus, search bars, auto-playing media, analytics
						widgets. The tradeoff is that it adds to the initial page load —
						every <code>comrade:eager</code> island competes for bandwidth with
						the rest of the page.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`<PropagandaRadio comrade:eager />`}</code>
					</pre>

					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<PropagandaRadio comrade:eager />
					</div>
					<p className="text-xs text-base-content/60 mt-2">
						The radio is already cycling headlines. JS loaded on page load — no
						interaction needed.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:patient */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						COMRADE:PATIENT
					</h2>
					<p className="text-base-content/60 italic mb-4">
						"I'll hydrate when everyone else is done"
					</p>
					<p className="text-base-content mb-4">
						Hydrates after the page settles, using{" "}
						<code>requestIdleCallback</code>. The browser finishes its critical
						work first — parsing, layout, painting — then hydrates this island
						during idle time.
					</p>
					<p className="text-base-content mb-4">
						Good for interactive elements that don't need to respond instantly:
						comment sections, toggles, secondary controls. The user sees the
						server-rendered HTML immediately; interactivity arrives a moment
						later, without blocking the initial paint.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`<Redactor comrade:patient />`}</code>
					</pre>

					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<Redactor comrade:patient />
					</div>
					<p className="text-xs text-base-content/60 mt-2">
						Toggle the switch. Censorship activates after the browser settles.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			{/* comrade:visible */}
			<section className="py-10 px-6 bg-base-100">
				<div className="max-w-4xl mx-auto">
					<h2 className="font-display text-3xl md:text-4xl text-secondary mb-6">
						COMRADE:VISIBLE{" "}
						<span className="badge badge-primary ml-2">DEFAULT</span>
					</h2>
					<p className="text-base-content/60 italic mb-4">
						"Only work when the people are watching"
					</p>
					<p className="text-base-content mb-4">
						Hydrates when the element scrolls into the viewport, using{" "}
						<code>IntersectionObserver</code> with a 100px buffer. This is the
						default — if you don't specify a directive, your island uses{" "}
						<code>comrade:visible</code>.
					</p>
					<p className="text-base-content mb-4">
						Best for most islands. Below-the-fold content stays as static HTML
						until the user scrolls to it. No JavaScript is fetched until then,
						which keeps the initial page load fast. The 100px buffer means
						hydration starts just before the element enters view, so the
						transition feels instant.
					</p>
					<pre className="bg-base-200 border-2 border-base-300 p-5 overflow-x-auto text-sm leading-relaxed mb-6">
						<code>{`// Explicit:
<FiveYearPlan comrade:visible />

// Or just omit the directive (same result):
<FiveYearPlan />`}</code>
					</pre>

					<div className="py-6 px-6 text-center border-2 border-dashed border-base-300 mb-4">
						<p className="text-base-content/80">
							↓ Scroll down to see <code>comrade:visible</code> in action ↓
						</p>
					</div>

					<div style={{ minHeight: "400px" }} />

					<div className="bg-base-200 p-4 border border-dashed border-base-300">
						<FiveYearPlan comrade:visible />
					</div>
					<p className="text-xs text-base-content/60 mt-2">
						The progress tracker only hydrated when you scrolled here. Check
						DevTools Network to verify.
					</p>
				</div>
			</section>

			<div className="divider max-w-4xl mx-auto" />

			<section className="py-10 px-6 bg-base-200">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-4">
						<a
							href="/guide/configuration"
							className="btn btn-outline btn-primary"
						>
							← Configuration
						</a>
						<a
							href="/guide/multi-framework"
							className="btn btn-outline btn-primary"
						>
							Multi-Framework →
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
