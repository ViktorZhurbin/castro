import { useState } from "preact/hooks";
import "./counter.css";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = useState(initial);

	return (
		<div class="counter-preact">
			<h3>Preact Counter Island</h3>
			<p>Count: {count}</p>
			<div class="buttons">
				<button onClick={() => setCount(count - 1)}>−</button>
				<button onClick={() => setCount(count + 1)}>+</button>
				<button onClick={() => setCount(initial)}>Reset</button>
			</div>
		</div>
	);
}
