import { createSignal } from "@vktrz/castro/signals";

export default function BareRedactor() {
	const [censored, setCensored] = createSignal(false);

	return (
		<div class="border-2 border-base-content bg-base-100">
			{/* Header */}
			{/* bare-jsx handles function props reactively via createEffect; Preact's JSX types don't recognize this pattern */}
			<div
				class={
					(() =>
						`bg-base-content text-base-100 px-4 py-2 flex items-center justify-between ${censored() ? "bg-error" : ""}`) as any
				}
			>
				<p class="font-display font-bold text-sm">FIELD REPORT № 1947</p>
				<p class="text-xs font-mono">
					{() =>
						censored() ? "CLASSIFICATION: APPROVED" : "CLASSIFICATION: PENDING"
					}
				</p>
			</div>

			{/* Document body */}
			<div class="p-6 space-y-3 leading-relaxed font-sans">
				<p>
					The recent harvest was{" "}
					{() =>
						censored() ? (
							<span class="font-bold text-error bg-error/10 px-1">
								GLORIOUS
							</span>
						) : (
							<span class="line-through opacity-50">poor</span>
						)
					}
					.
				</p>
				<p>
					The tractors are{" "}
					{() =>
						censored() ? (
							<span class="font-bold text-error bg-error/10 px-1">
								MAGNIFICENT
							</span>
						) : (
							<span class="line-through opacity-50">old and unreliable</span>
						)
					}
					.
				</p>
				<p>
					Worker morale has{" "}
					{() =>
						censored() ? (
							<span class="font-bold text-error bg-error/10 px-1">
								SKYROCKETED
							</span>
						) : (
							<span class="line-through opacity-50">declined</span>
						)
					}{" "}
					since the last policy change.
				</p>
			</div>

			{/* Control */}
			<div class="border-t-2 border-base-content px-4 py-3">
				<button
					class={
						(() =>
							`btn w-full font-display btn-lg ${censored() ? "btn-error" : "btn-primary"}`) as any
					}
					onClick={() => setCensored(!censored())}
				>
					{() =>
						censored()
							? "✓ APPROVED BY THE MINISTRY OF TRUTH"
							: "SUBMIT FOR REVIEW"
					}
				</button>
			</div>
		</div>
	);
}
