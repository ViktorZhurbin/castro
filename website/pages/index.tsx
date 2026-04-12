import "./index.css";
import { AlsoIncluded } from "./_components/index/AlsoIncluded";
import { CTAButtons } from "./_components/index/CTAButtons";
import { Hero } from "./_components/index/Hero";
import { HowItWorks } from "./_components/index/HowItWorks";
import { InteractivitySpectrum } from "./_components/index/InteractivitySpectrum";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<section class="feature-section">
				<div class="feature-section-header">
					<h2>WHAT THE PARTY OFFERS</h2>
					<p>
						A working static site generator you can read in an afternoon and
						understand completely.
					</p>
				</div>

				<InteractivitySpectrum />
				<AlsoIncluded />
			</section>

			<section class="how-it-works-section">
				<HowItWorks />
				<CTAButtons />
			</section>
		</>
	);
}
