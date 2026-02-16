import Counter from "../components/Counter.island.tsx";
import Badge from "../components/Badge.island.tsx";

export const meta = { title: "Multi" };

export default function Multi() {
	return (
		<div>
			<h1>Multi Test</h1>
			<Counter initial={1} comrade:visible />
			<Badge label="hello" comrade:visible />
		</div>
	);
}
