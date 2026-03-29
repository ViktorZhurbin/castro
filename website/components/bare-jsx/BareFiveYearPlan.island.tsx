/** @jsxImportSource @vktrz/castro/runtime/jsx/dom */
import { createEffect, createSignal } from "@vktrz/castro/signals";

export default function BareFiveYearPlan() {
	const [progress, setProgress] = createSignal(0);
	const [quota, setQuota] = createSignal(1);
	const [badge, setBadge] = createSignal<{
		text: string;
		style: string;
	} | null>(null);

	createEffect(() => {
		const p = progress();

		if (p >= 50) {
			setBadge({ text: "Record Output!", style: "badge-success" });
		}
		if (p >= 25) {
			setBadge({ text: "Adequate Output", style: "badge-info" });
		}
	});

	function work() {
		const next = progress() + 5;

		if (next >= 100) {
			setQuota((q) => q + 1);
			setProgress(0);
		} else {
			setProgress(next);
		}
	}

	return (
		<div class="border-2 border-base-content bg-base-100">
			{/* Header */}
			<div class="bg-base-content text-base-100 px-4 py-2 flex items-center justify-between">
				<p class="font-display font-bold text-sm">FIVE-YEAR PLAN</p>
				<p class="text-xs font-mono">QUOTA #{() => quota()}</p>
			</div>

			{/* Content */}
			<div class="p-6 space-y-4">
				{/* Progress readout */}
				<div class="flex items-baseline justify-between">
					<p class="font-display text-sm font-bold">TRACTOR PRODUCTION</p>
					<p class="font-mono text-2xl font-bold">
						{() => progress().toString().padStart(3, " ")}%
					</p>
					{/* Badge */}
					{() => {
						const b = badge();
						return b ? <div class={`badge ${b.style}`}>{b.text}</div> : <div />;
					}}
				</div>

				{/* Progress bar */}
				<progress
					class="progress progress-primary w-full"
					value={progress}
					max="100"
				/>
			</div>

			{/* Control */}
			<div class="border-t-2 border-base-content px-4 py-3">
				<button
					class="btn btn-primary btn-lg w-full font-display"
					onClick={work}
				>
					WORK HARDER, COMRADE!
				</button>
			</div>
		</div>
	);
}
