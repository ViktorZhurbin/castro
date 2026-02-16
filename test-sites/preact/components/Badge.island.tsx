import "./Badge.island.css";
import Label from "./Label.tsx";

export default function Badge({ label = "badge" }) {
	return (
		<span class="badge">
			<Label text={label} />
		</span>
	);
}
