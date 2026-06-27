import "./IslandShowcase.css";
import PropagandaRadio from "@/components/islandExamples/PropagandaRadio.island";
import { CTAButtons } from "./CTAButtons";

export function IslandShowcase() {
	return (
		<section class="island-showcase">
			<div class="container">
				<div class="island-showcase-container">
					<p class="island-showcase-label">A LIVE ISLAND</p>
					<PropagandaRadio comrade:visible className="island-showcase-island" />
				</div>
				<CTAButtons className="island-showcase-cta" />
			</div>
		</section>
	);
}
