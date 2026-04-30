import "./index.css";
import { CTAButtons } from "./_components/index/CTAButtons";
import { Foundation } from "./_components/index/Foundation";
import { Hero } from "./_components/index/Hero";
import { HowItWorks } from "./_components/index/HowItWorks";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<Foundation />

			<section class="how-it-works-section">
				<HowItWorks />
				<CTAButtons />
			</section>
		</>
	);
}
