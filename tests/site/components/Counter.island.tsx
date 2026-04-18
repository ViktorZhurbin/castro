import "./Counter.island.css";
import { useSignal } from "@preact/signals";

export default function Counter({ initial = 0 }) {
	const count = useSignal(initial);
	return (
		<button
			onClick={() => {
				count.value++;
			}}
		>
			Count: {count}
		</button>
	);
}
