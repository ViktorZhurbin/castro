import Counter from "../components/Counter.island.tsx";
import SolidCounter from "../components/solid/SolidCounter.island.tsx";

export const meta = { title: "Mixed" };

export default function Mixed() {
	return (
		<div>
			<h1>Mixed Frameworks Test</h1>
			<Counter initial={1} comrade:visible />
			<SolidCounter initial={1} comrade:visible />
		</div>
	);
}
