import Counter from "../components/Counter.island.tsx";

export const meta = { title: "EagerTest" };

export default function EagerTest() {
	return (
		<div>
			<h1>Eager Test</h1>
			<Counter initial={10} comrade:eager />
		</div>
	);
}
