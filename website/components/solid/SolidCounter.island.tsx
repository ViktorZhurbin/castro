import { createSignal } from "solid-js";

interface CounterProps {
	initial?: number;
}

export default function SolidCounter(props: CounterProps) {
	const [count, setCount] = createSignal(props.initial ?? 0);

	return (
		<div class="card card-border border-base-300 card-sm bg-base-100">
			<div class="card-body">
				<h3 class="card-title text-accent font-display text-xl">
					SOLID COUNTER ISLAND
				</h3>
				<p class="text-2xl">Count: {count()}</p>
				<div class="card-actions">
					<button
						class="btn btn-secondary btn-sm"
						onClick={() => setCount((c) => c - 1)}
					>
						−
					</button>
					<button
						class="btn btn-secondary btn-sm"
						onClick={() => setCount((c) => c + 1)}
					>
						+
					</button>
					<button
						class="btn btn-outline btn-sm"
						onClick={() => setCount(props.initial ?? 0)}
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}
