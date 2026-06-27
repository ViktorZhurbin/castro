import "./IslandShowcase.css";
import PropagandaRadio from "@/components/islandExamples/PropagandaRadio.island";

export function IslandShowcase() {
	return (
		<section class="island-showcase">
			<div class="container">
				<p class="island-showcase-label">A LIVE ISLAND</p>
				<p class="island-showcase-intro">
					Everything above is static HTML. This widget is an island: its
					JavaScript loads only when it scrolls into view, then hydrates in
					place. Go on, exceed your quota.
				</p>
				<PropagandaRadio comrade:visible />
			</div>
		</section>
	);
}
