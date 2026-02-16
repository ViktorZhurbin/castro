import { useState } from "preact/hooks";
import styles from "./Clicker.module.css";

export default function Clicker() {
	const [on, setOn] = useState(false);
	return (
		<button class={styles.clicker} onClick={() => setOn(!on)}>
			{on ? "ON" : "OFF"}
		</button>
	);
}
