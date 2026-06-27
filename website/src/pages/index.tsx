import { Foundation } from "./_components/index/Foundation";
import { Hero } from "./_components/index/Hero";
import { IslandShowcase } from "./_components/index/IslandShowcase";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<Foundation />

			<IslandShowcase />
		</>
	);
}
