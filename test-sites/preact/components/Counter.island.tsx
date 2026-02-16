import { useState } from "preact/hooks";
import "./Counter.island.css";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = useState(initial);
	return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
