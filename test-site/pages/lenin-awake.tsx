import Counter from "../components/Counter.island.tsx";

export const meta = { title: "LeninAwake" };

export default function LeninAwake() {
	return (
		<div>
			<h1>Awake Test</h1>
			<Counter initial={10} lenin:awake />
		</div>
	);
}
