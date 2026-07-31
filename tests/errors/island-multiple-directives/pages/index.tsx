import Counter from "../components/Counter.island";

export default function Home() {
	return (
		<div>
			<h1>Home</h1>
			<Counter comrade:eager comrade:visible />
		</div>
	);
}
