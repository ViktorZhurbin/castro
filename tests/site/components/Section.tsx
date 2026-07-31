import Counter from "./Counter.island.tsx";

type Props = { title: string };

export default function Section({ title }: Props) {
	return (
		<section>
			<h2>{title}</h2>
			<Counter initial={42} comrade:visible />
		</section>
	);
}
