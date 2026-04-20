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

			<section class="spectrum-section">
				<InteractivitySpectrum />
			</section>

			<AlsoIncluded />

			<section class="how-it-works-section">
				<HowItWorks />
				<CTAButtons />
			</section>
		</>
	);
}
