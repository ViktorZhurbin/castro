import BareCounter from "../components/bare-jsx/BareCounter.island.tsx";

export const meta = { title: "Bare" };

export default function Bare() {
	return (
		<div>
			<h1>Bare Test</h1>
			<BareCounter initial={5} comrade:visible />
		</div>
	);
}
