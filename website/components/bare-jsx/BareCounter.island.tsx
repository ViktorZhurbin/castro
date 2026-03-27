import { createSignal } from "@vktrz/castro/signals";

interface CounterProps {
	initial?: number;
}

export default function BareCounter({ initial = 0 }: CounterProps) {
	const [count, setCount] = createSignal(initial);

	return (
		<div class="card card-border border-base-300 card-sm bg-base-100">
			<div class="card-body">
				<h3 class="card-title text-accent font-display text-xl">
					BARE COUNTER ISLAND
				</h3>
				<p class="text-2xl">Count: {count}</p>
				<div class="card-actions">
					<button
						class="btn btn-accent btn-sm"
						onClick={() => setCount((c) => c - 1)}
					>
						−
					</button>
					<button
						class="btn btn-accent btn-sm"
						onClick={() => setCount((c) => c + 1)}
					>
						+
					</button>
					<button
						class="btn btn-outline btn-sm"
						onClick={() => setCount(initial)}
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}
