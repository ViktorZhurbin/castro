import { createSignal } from "solid-js";
import "./counter.css";

export default function Counter() {
	const [count, setCount] = createSignal(0);

	return (
		<div class="counter-solid">
			<h3>Solid Counter Island</h3>
			<p>Count: {count()}</p>
			<div class="buttons">
				<button onClick={() => setCount(count() - 1)}>−</button>
				<button onClick={() => setCount(count() + 1)}>+</button>
				<button onClick={() => setCount(0)}>Reset</button>
			</div>
		</div>
	);
}
