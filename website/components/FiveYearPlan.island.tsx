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
				<p>FIVE-YEAR PLAN</p>
				<p>QUOTA #{quota}</p>
			</div>

			{/* Content */}
			<div class="five-year-plan-content">
				{/* Progress readout */}
				<div class="five-year-plan-readout">
					<p>TRACTOR PRODUCTION</p>
					<p>{progress.toString().padStart(3, " ")}%</p>
					{/* Badge */}
					{badge && <div class={`badge ${badge.style}`}>{badge.text}</div>}
				</div>

				{/* Progress bar */}
				<progress value={progress} max="100" />
			</div>

			{/* Control */}
			<div class="five-year-plan-control">
				<button onClick={work}>WORK HARDER, COMRADE!</button>
			</div>
		</div>
	);
}
