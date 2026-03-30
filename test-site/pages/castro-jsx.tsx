import CastroCounter from "../components/castro-jsx/CastroCounter.island.tsx";
import CastroFragmentToggle from "../components/castro-jsx/CastroFragmentToggle.island.tsx";

export const meta = { title: "Castro" };

export default function Castro() {
	return (
		<div>
			<h1>Castro Test</h1>
			<CastroCounter initial={5} comrade:visible />
			<CastroFragmentToggle comrade:eager />
		</div>
	);
}
