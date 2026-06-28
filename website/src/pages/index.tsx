import { Hero } from "./_components/index/Hero";
import { HowItWorks } from "./_components/index/HowItWorks";
import { IslandShowcase } from "./_components/index/IslandShowcase";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<HowItWorks />

			<IslandShowcase />
		</>
	);
}
