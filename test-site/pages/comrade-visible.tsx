import Counter from "../components/Counter.island.tsx";

export const meta = { title: "ComradeVisible" };

export default function ComradeVisible() {
	return (
		<div>
			<h1>Visible Test</h1>
			<Counter initial={5} comrade:visible />
		</div>
	);
}
