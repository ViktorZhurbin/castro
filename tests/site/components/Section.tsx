import Counter from "./Counter.island.tsx";

export default function Section({ title }) {
	return (
		<section>
			<h2>{title}</h2>
			<Counter initial={42} comrade:visible />
		</section>
	);
}
