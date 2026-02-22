import { useState } from "preact/hooks";

interface CounterProps {
	initial?: number;
}

export const MyCounter = ({ initial = 0 }: CounterProps) => {
	const [count, setCount] = useState<number>(initial);

	return (
		<div className="card card-border card-sm bg-base-100">
			<div className="card-body">
				<h3 className="card-title text-primary">Preact Counter Island</h3>
				<p className="text-2xl font-semibold">Count: {count}</p>
				<div className="card-actions">
					<button
						className="btn btn-primary btn-sm"
						onClick={() => setCount(count - 1)}
					>
						−
					</button>
					<button
						className="btn btn-primary btn-sm"
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
