import { useState } from "preact/hooks";
import "./Redactor.css";

export default function Redactor() {
	const [censored, setCensored] = useState(false);

	return (
		<div class="redactor">
			{/* Header */}
			<div class={`redactor-header ${censored ? "approved" : ""}`}>
				<h4>FIELD REPORT № 1947</h4>
				<h4>
					{censored ? "CLASSIFICATION: APPROVED" : "CLASSIFICATION: PENDING"}
				</h4>
			</div>

			{/* Document body */}
			<div class="redactor-content">
				<p>
					The recent harvest was{" "}
					{censored ? <ins>GLORIOUS</ins> : <del>poor</del>}.
				</p>
				<p>
					The tractors are{" "}
					{censored ? <ins>MAGNIFICENT</ins> : <del>old and unreliable</del>}.
				</p>
				<p>
					Worker morale has{" "}
					{censored ? <ins>SKYROCKETED</ins> : <del>declined</del>} since the
					last policy change.
				</p>
			</div>

			{/* Control */}
			<div class="redactor-control">
				<button
					class={`btn btn-primary btn-full ${censored ? "approved" : ""}`}
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
