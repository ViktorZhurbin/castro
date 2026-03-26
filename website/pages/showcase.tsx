import type { PageMeta } from "@vktrz/castro";
import BareCounter from "../components/bare-jsx/BareCounter.island.tsx";
import Counter from "../components/Counter.island.tsx";
import { DirectiveCard } from "../components/DirectiveCard.tsx";
import SolidCounter from "../components/solid/SolidCounter.island.tsx";

export const meta: PageMeta = {
	title: "Showcase — Castro",
	path: "/showcase",
};

export default function Showcase() {
	return (
		<section className="py-24 px-6 bg-base-100">
			<div className="text-center mb-16">
				<h1 className="font-display text-5xl md:text-6xl text-primary">
					THE REVOLUTIONARY DIRECTIVES
				</h1>
				<div className="divider divider-primary max-w-xs mx-auto" />
				<p className="max-w-xl mx-auto text-base-content">
					Four hydration strategies, live on this page. Open DevTools to see
					what JavaScript gets loaded — and when.
				</p>
			</div>

			<div className="space-y-8 max-w-2xl mx-auto">
				<DirectiveCard
					name="LENIN:AWAKE"
					slogan='"The leader is always ready"'
					description="Component becomes interactive immediately on page load. Full interactivity from the start."
					note="This counter is interactive right now. JS loaded on page load."
					color="primary"
				>
					<Counter initial={10} lenin:awake />
				</DirectiveCard>

				<DirectiveCard
					name="COMRADE:IDLE"
					slogan='"Work when nobody else is busy"'
					description="Component hydrates after page load, when browser is idle. Uses requestIdleCallback for efficient scheduling."
					note="A bare-jsx island (no VDOM, no CDN). Loads after the page settles — check DevTools Network to see bare-jsx.js arrive."
					color="accent"
				>
					<BareCounter initial={12} comrade:idle />
				</DirectiveCard>

				<div className="py-8 px-6 text-center border-2 border-dashed border-base-300">
					<p className="text-base-content/80">
						↓ Scroll down to see <code>comrade:visible</code> in action ↓
					</p>
				</div>

				<div style={{ minHeight: "600px" }} />

				<DirectiveCard
					name="COMRADE:VISIBLE"
					slogan='"Only work when the people are watching"'
					description="Component hydrates when scrolled into viewport. Lazy loading with IntersectionObserver. Default behavior."
					note="A Solid island! JS loads when you scroll into view. Open DevTools Network tab to verify."
					color="secondary"
				>
					<SolidCounter initial={15} comrade:visible />
				</DirectiveCard>

				<div style={{ minHeight: "400px" }} />

				<DirectiveCard
					name="NO:PASARAN"
					slogan='"They shall not pass (to the client)"'
					description="Component renders at build time only. In practice, use a regular Component.tsx if you don't need interactivity. This directive is here for the memes."
					note="Try clicking. Nothing happens. Zero JS was sent to your browser."
					color="neutral"
				>
					<Counter initial={5} no:pasaran />
				</DirectiveCard>
			</div>
		</section>
	);
}
