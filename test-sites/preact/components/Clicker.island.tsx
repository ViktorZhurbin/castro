import { useSignal } from "@preact/signals";
import styles from "./Clicker.module.css";

export default function Clicker() {
	const on = useSignal(false);
	return (
		<button
			class={styles.clicker}
			onClick={() => {
				on.value = !on;
			}}
		>
			{on ? "ON" : "OFF"}
		</button>
	);
}
