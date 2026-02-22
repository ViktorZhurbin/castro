import { useState } from "preact/hooks";

interface CounterProps {
	initial?: number;
}

export const MyCounter = ({ initial = 0 }: CounterProps) => {
	const [count, setCount] = useState<number>(initial);

	return (
		<div className="card card-border border-base-300 card-sm bg-base-100">
			<div className="card-body">
				<h3 className="card-title text-secondary font-display text-xl tracking-wide">
					PREACT COUNTER ISLAND
				</h3>
				<p className="text-3xl font-bold tabular-nums">
					Count: {count}
				</p>
				<div className="card-actions">
					<button
						className="btn btn-secondary btn-sm"
						onClick={() => setCount(count - 1)}
					>
						−
					</button>
					<button
						className="btn btn-secondary btn-sm"
						onClick={() => setCount(count + 1)}
					>
						+
					</button>
					<button
						className="btn btn-outline btn-sm"
						onClick={() => setCount(initial)}
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
};

export default MyCounter;
