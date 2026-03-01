import Counter from "../components/Counter.island.tsx";

export const meta = { title: "No Pasaran" };

export default function NoPasaran() {
	return (
		<div>
			<h1>No Pasaran Test</h1>
			<Counter initial={0} no:pasaran />
		</div>
	);
}
