import Counter from "../components/Counter.island.tsx";

export const meta = { title: "Idle" };

export default function Idle() {
	return (
		<div>
			<h1>Idle Test</h1>
			<Counter initial={5} comrade:idle />
		</div>
	);
}
