import { useState } from "preact/hooks";
import "./Redactor.css";

export default function Redactor() {
	const [censored, setCensored] = useState(false);

	return (
		<div class="redactor">
			{/* Header */}
			<div class={`redactor-header ${censored ? "approved" : ""}`}>
				<h4>FIELD REPORT № 2847</h4>
				<h4>
					{censored ? "CLASSIFICATION: APPROVED" : "CLASSIFICATION: PENDING"}
				</h4>
			</div>

			{/* Document body */}
			<div class="redactor-content">
				<p>
					Q3 grain output:{" "}
					{censored ? (
						<ins>HISTORIC SURPLUS</ins>
					) : (
						<span>43% of target</span>
					)}
					.
				</p>
				<p>
					District 7 tractors operational:{" "}
					{censored ? (
						<ins>ALL OF THEM</ins>
					) : (
						<span>3 of 11</span>
					)}
					.
				</p>
				<p>
					Saturday brigade sign-ups:{" "}
					{censored ? <ins>UNANIMOUS</ins> : <span>12%</span>}.
				</p>
			</div>

			{/* Control */}
			<div class="redactor-control">
				<button
					class={`btn btn-primary btn-full ${censored ? "approved" : ""}`}
					onClick={() => setCensored(!censored)}
				>
					{censored
						? "✓ APPROVED FOR DISTRIBUTION"
						: "SUBMIT FOR REVIEW"}
				</button>
			</div>
		</div>
	);
}
