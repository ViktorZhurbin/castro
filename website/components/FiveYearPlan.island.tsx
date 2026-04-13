import { useEffect, useState } from "preact/hooks";
import "./FiveYearPlan.css";

// Production status messages shown on the button after a quota is fulfilled.
// Displayed briefly before returning to the default work prompt.
const FULFILLMENT_MESSAGES = [
	"QUOTA FULFILLED. QUOTA RAISED.",
	"TARGET ACHIEVED. NEW TARGET ISSUED.",
	"THE PLAN SUCCEEDS. THE PLAN CONTINUES.",
	"OUTPUT NOTED. NORMS ADJUSTED.",
];

export default function FiveYearPlan() {
	const [progress, setProgress] = useState(0);
	const [cycle, setCycle] = useState(1);
	const [fulfilled, setFulfilled] = useState(false);
	const [fulfillmentMessage, setFulfillmentMessage] = useState("");

	// Badge derives directly from progress — no separate effect needed.
	// Stakhanovite: real historical term for Soviet overachievers, rewarded
	// (and then quietly resented) for exceeding quotas.
	const badge =
		progress >= 50
			? { text: "STAKHANOVITE PACE", style: "badge-primary" }
			: progress >= 25
				? { text: "SATISFACTORY TOIL", style: "badge-base" }
				: null;

	// Clear the fulfillment flash after a short delay.
	useEffect(() => {
		if (!fulfilled) return;
		const id = setTimeout(() => setFulfilled(false), 2200);
		return () => clearTimeout(id);
	}, [fulfilled]);

	function work() {
		const next = progress + 5;

		if (next >= 100) {
			// Pick a random fulfillment message — variety rewards repeated clicking.
			const msg =
				FULFILLMENT_MESSAGES[
					Math.floor(Math.random() * FULFILLMENT_MESSAGES.length)
				];

			if (msg) {
				setFulfillmentMessage(msg);
			}

			setFulfilled(true);
			setCycle((c) => c + 1);
			setProgress(0);
		} else {
			setProgress(next);
		}
	}

	return (
		<div class="five-year-plan">
			{/* Header */}
			<div class="five-year-plan-header">
				<h4>FIVE-YEAR PLAN</h4>
				<h4>CYCLE #{cycle}</h4>
			</div>

			{/* Content */}
			<div class="five-year-plan-content">
				<div class="five-year-plan-readout">
					<div>
						<h3>TRACTOR OUTPUT</h3>
						<h3>{progress.toString().padStart(3, " ")}%</h3>
					</div>
					{badge && <div class={`badge ${badge.style}`}>{badge.text}</div>}
				</div>

				<progress value={progress} max="100" />

				<button class="btn btn-primary btn-full" onClick={work}>
					{fulfilled ? fulfillmentMessage : "WORK HARDER, COMRADE!"}
				</button>
			</div>
		</div>
	);
}
