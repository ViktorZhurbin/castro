import { createSignal } from "@vktrz/castro-jsx/signals";

export default function CastroCounter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return (
		<button onClick={() => setCount((c) => c + 1)}>Castro: {count}</button>
	);
}
