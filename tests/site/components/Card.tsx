import type { ComponentChildren } from "preact";
import styles from "./Card.module.css";

type Props = { children: ComponentChildren };

export default function Card({ children }: Props) {
	return <div class={styles.card}>{children}</div>;
}
