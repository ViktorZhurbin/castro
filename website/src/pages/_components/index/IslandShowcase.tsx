import "./IslandShowcase.css";
import PropagandaRadio from "@/components/islandExamples/PropagandaRadio.island";
import { CTAButtons } from "./CTAButtons";

export function IslandShowcase() {
	return (
		<section class="island-showcase">
			<div class="container">
				<div class="island-showcase-container">
					<p class="island-showcase-label">A LIVE ISLAND</p>
					<p class="island-showcase-desc">This radio is the only interactive island on the page. Everything else is static HTML.</p>
					<PropagandaRadio comrade:visible className="island-showcase-island" />
				</div>
				<CTAButtons className="island-showcase-cta" />
			</div>
		</section>
	);
}
