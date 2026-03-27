import { createMemo, createSignal } from "solid-js";

export default function FiveYearPlan() {
	const [progress, setProgress] = createSignal(0);
	const [quota, setQuota] = createSignal(1);

	const target = () => quota() * 100;

	const badge = createMemo(() => {
		const p = progress();
		if (p >= 50) return { text: "Record Output!", style: "badge-success" };
		if (p >= 25) return { text: "Adequate Output", style: "badge-info" };
		return null;
	});

	function work() {
		const next = progress() + 3;
		if (next >= 100) {
			setQuota((q) => q + 1);
			setProgress(0);
		} else {
			setProgress(next);
		}
	}

	return (
		<div>
			<p class="text-sm mb-2">
				Tractor Production: {progress}% of {target}% quota
			</p>
			<progress
				class="progress progress-primary w-full mb-3"
				value={progress()}
				max="100"
			/>
			<div class="flex items-center gap-3">
				<button class="btn btn-primary btn-sm" onClick={work}>
					WORK HARDER, COMRADE!
				</button>
				{badge() && (
					<span class={`badge ${badge()!.style}`}>{badge()!.text}</span>
				)}
			</div>
		</div>
	);
}
