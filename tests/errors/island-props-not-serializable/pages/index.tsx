import Counter from "../components/Counter.island";

// Cyclic, but not a VNode: SSR renders it fine and only JSON.stringify chokes,
// which is the path left over once renderMarker rejects children upfront.
const data = { name: "Comrade" };
data.self = data;

export default function Home() {
	return (
		<div>
			<h1>Home</h1>
			<Counter data={data} />
		</div>
	);
}
