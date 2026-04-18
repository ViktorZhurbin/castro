import Card from "../components/Card.tsx";
import Clicker from "../components/Clicker.island.tsx";

export const meta = { title: "CSS Modules" };

export default function CssModules() {
	return (
		<div>
			<h1>CSS Modules Test</h1>
			<Card>Hello from card</Card>
			<Clicker comrade:visible />
		</div>
	);
}
