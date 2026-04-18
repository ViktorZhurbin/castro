import VanillaButton from "../components/VanillaButton.island.tsx";
import VanillaCounter from "../components/VanillaCounter.island.tsx";

export const meta = { title: "Vanilla Island Test" };

export default function VanillaTest() {
	return (
		<div>
			<h1>Vanilla Island Test</h1>
			<p>Pure JavaScript hydration, zero framework runtime.</p>
			<VanillaCounter initial={10} comrade:eager />
			<VanillaButton label="Export-detected" comrade:visible />
		</div>
	);
}
