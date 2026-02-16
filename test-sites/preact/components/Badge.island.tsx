import "./Badge.island.css";

export default function Badge({ label = "badge" }) {
	return <span class="badge">{label}</span>;
}
