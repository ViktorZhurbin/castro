import { createSignal } from "@vktrz/castro/signals";

export default function BareCounter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return <button onClick={() => setCount((c) => c + 1)}>Bare: {count}</button>;
}
