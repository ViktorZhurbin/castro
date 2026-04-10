import { useState } from "preact/hooks";
import "./Redactor.css";

export default function Redactor() {
	const [censored, setCensored] = useState(false);

	return (
		<div class="redactor">
			{/* Header */}
			<div class={`redactor-header ${censored ? "approved" : ""}`}>
				<p>FIELD REPORT № 1947</p>
				<p>
					{censored ? "CLASSIFICATION: APPROVED" : "CLASSIFICATION: PENDING"}
				</p>
			</div>

			{/* Document body */}
			<div class="redactor-content">
				<p>
					The recent harvest was{" "}
					{censored ? (
						<span class="censored">GLORIOUS</span>
					) : (
						<span class="strikethrough">poor</span>
					)}
					.
				</p>
				<p>
					The tractors are{" "}
					{censored ? (
						<span class="censored">MAGNIFICENT</span>
					) : (
						<span class="strikethrough">old and unreliable</span>
					)}
					.
				</p>
				<p>
					Worker morale has{" "}
					{censored ? (
						<span class="censored">SKYROCKETED</span>
					) : (
						<span class="strikethrough">declined</span>
					)}{" "}
					since the last policy change.
				</p>
			</div>

			{/* Control */}
			<div class="redactor-control">
				<button
					class={censored ? "approved" : ""}
					onClick={() => setCensored(!censored)}
				>
					{censored
						? "✓ APPROVED BY THE MINISTRY OF TRUTH"
						: "SUBMIT FOR REVIEW"}
				</button>
			</div>
		</div>
	);
}
