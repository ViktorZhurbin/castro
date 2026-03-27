import { createSignal } from "@vktrz/castro/signals";

export default function Redactor() {
	const [censored, setCensored] = createSignal(false);

	return (
		<div>
			<label class="flex items-center gap-3 mb-4 cursor-pointer">
				<input
					type="checkbox"
					class="toggle toggle-error"
					onChange={(e) => setCensored((e.target as HTMLInputElement).checked)}
				/>
				<span class="font-display text-sm">APPLY STATE CENSORSHIP</span>
			</label>
			<p class="leading-relaxed">
				The recent harvest was{" "}
				{() =>
					censored() ? (
						<span class="font-bold text-error">GLORIOUS</span>
					) : (
						<span>poor</span>
					)
				}
				. The tractors are{" "}
				{() =>
					censored() ? (
						<span class="font-bold text-error">MAGNIFICENT</span>
					) : (
						<span>old and unreliable</span>
					)
				}
				. Worker morale has{" "}
				{() =>
					censored() ? (
						<span class="font-bold text-error">SKYROCKETED</span>
					) : (
						<span>declined</span>
					)
				}{" "}
				since the last policy change.
			</p>
		</div>
	);
}
