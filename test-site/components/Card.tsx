import styles from "./Card.module.css";

export default function Card({ children }) {
	return <div class={styles.card}>{children}</div>;
}
