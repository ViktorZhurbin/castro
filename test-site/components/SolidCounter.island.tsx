/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";

export default function SolidCounter(props) {
	const [count, setCount] = createSignal(props.initial ?? 0);

	return (
		<button onClick={() => setCount((c) => c + 1)}>Solid: {count()}</button>
	);
}
