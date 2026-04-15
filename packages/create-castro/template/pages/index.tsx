import Greeting from "@/components/Greeting";

export const meta = {
	title: "Home",
};

export default function Home() {
	return (
		<main>
			<h1>The revolution has been scaffolded.</h1>
			<Greeting name="Comrade" />
			<p>
				Edit <code>pages/index.tsx</code> to begin.
			</p>
		</main>
	);
}
