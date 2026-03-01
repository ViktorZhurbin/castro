import SolidCounter from "../components/solid/SolidCounter.island.tsx";

export const meta = { title: "Solid Only" };

export default function SolidOnly() {
	return (
		<div>
			<h1>Solid Only Test</h1>
			<SolidCounter initial={5} no:pasaran />
		</div>
	);
}
