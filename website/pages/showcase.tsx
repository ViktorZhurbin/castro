import type { PageMeta } from "@vktrz/castro";
import { DirectiveCard } from "../components/DirectiveCard.tsx";
import MyCounter from "../components/MyCounter.island.tsx";
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
					Three hydration strategies, live on this page. Open DevTools to see
					what JavaScript gets loaded — and when.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				<DirectiveCard
					name="NO:PASARAN"
					slogan='"They shall not pass (to the client)"'
					description="Component renders at build time. No JavaScript shipped to client. Pure static HTML for maximum performance."
					note="Try clicking. Nothing happens. Zero JS was sent to your browser."
					color="neutral"
				>
					<MyCounter initial={5} no:pasaran />
				</DirectiveCard>

				<DirectiveCard
					name="LENIN:AWAKE"
					slogan='"The leader is always ready"'
					description="Component becomes interactive immediately on page load. Full interactivity from the start."
					note="This counter is interactive immediately. JS loaded on page load."
					color="primary"
				>
					<MyCounter initial={10} lenin:awake />
				</DirectiveCard>

				<DirectiveCard
					name="COMRADE:VISIBLE"
					slogan='"Only work when the people are watching"'
					description="Component hydrates when scrolled into viewport. Lazy loading with IntersectionObserver. Default behavior."
					note="A Solid island! JS loads when scrolled into view. Open DevTools Network tab to verify."
					color="secondary"
				>
					<SolidCounter initial={15} comrade:visible />
				</DirectiveCard>
			</div>
		</section>
	);
}
