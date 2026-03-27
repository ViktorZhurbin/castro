import type { PageMeta } from "@vktrz/castro";
import { DirectiveCard } from "../components/DirectiveCard.tsx";
import PropagandaRadio from "../components/PropagandaRadio.island.tsx";
import Redactor from "../components/bare-jsx/Redactor.island.tsx";
import FiveYearPlan from "../components/solid/FiveYearPlan.island.tsx";

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
					description="The State Radio is always broadcasting. This island hydrates immediately on page load — the timer starts before you even look at it."
					note="Already broadcasting. JS loaded on page load — no interaction needed."
					color="primary"
				>
					<PropagandaRadio lenin:awake />
				</DirectiveCard>

				<DirectiveCard
					name="COMRADE:IDLE"
					slogan='"Work when nobody else is busy"'
					description="The Ministry's censorship toggle activates after the page settles. Built with Castro's bare-jsx runtime — signals and direct DOM, no virtual DOM, no CDN."
					note="A bare-jsx island (no VDOM, no CDN). Toggle the switch — censorship activates after the browser settles."
					color="accent"
				>
					<Redactor comrade:idle />
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
					description="The Five-Year Plan tracker only begins when you scroll here. Solid's fine-grained reactivity updates the progress bar attribute directly."
					note="A Solid island. The quota starts when you scroll here. Check DevTools Network to see SolidJS arrive."
					color="secondary"
				>
					<FiveYearPlan comrade:visible />
				</DirectiveCard>
			</div>
		</section>
	);
}
