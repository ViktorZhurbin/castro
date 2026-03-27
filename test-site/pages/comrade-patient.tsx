import Counter from "../components/Counter.island.tsx";

export const meta = { title: "ComradePatient" };

export default function ComradePatient() {
	return (
		<div>
			<h1>Idle Test</h1>
			<Counter initial={5} comrade:patient />
		</div>
	);
}
