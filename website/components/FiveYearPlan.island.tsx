import { useEffect, useState } from "preact/hooks";
import "./FiveYearPlan.css";

export default function FiveYearPlan() {
	const [progress, setProgress] = useState(0);
	const [quota, setQuota] = useState(1);
	const [badge, setBadge] = useState<{
		text: string;
		style: string;
	} | null>(null);

	useEffect(() => {
		if (progress >= 50) {
			setBadge({ text: "Record Output!", style: "badge-primary" });
		} else if (progress >= 25) {
			setBadge({ text: "Adequate Output", style: "badge-base" });
		}
	}, [progress]);

	function work() {
		const next = progress + 5;

		if (next >= 100) {
			setQuota((q) => q + 1);
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
				<h4>QUOTA #{quota}</h4>
			</div>

			{/* Content */}
			<div class="five-year-plan-content">
				{/* Progress readout */}
				<div class="five-year-plan-readout">
					<h3>TRACTOR PRODUCTION</h3>
					<h3>{progress.toString().padStart(3, " ")}%</h3>
					{/* Badge */}
					{badge && <div class={`badge ${badge.style}`}>{badge.text}</div>}
				</div>

				{/* Progress bar */}
				<progress value={progress} max="100" />
			</div>

			{/* Control */}
			<div class="five-year-plan-control">
				<button class="btn btn-primary btn-full" onClick={work}>
					WORK HARDER, COMRADE!
				</button>
			</div>
		</div>
	);
}
