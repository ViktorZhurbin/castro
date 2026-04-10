import { useEffect, useState } from "preact/hooks";

const HEADLINES = [
	"Harvest exceeds expectations by 400%",
	"Framework stability improved by decree",
	"Virtual DOM dissidents sent to re-education",
	"Bundle sizes redistributed equally",
	"Hydration deemed mandatory for all components",
	"Central Committee approves new CSS standard",
];

export default function PropagandaRadio() {
	const [index, setIndex] = useState(0);

	function prev() {
		setIndex((i) => (i - 1 + HEADLINES.length) % HEADLINES.length);
	}

	function next() {
		setIndex((i) => (i + 1) % HEADLINES.length);
	}

	useEffect(() => {
		const id = setInterval(() => {
			next();
		}, 3000);
		return () => clearInterval(id);
	}, []);

	return (
		<div class="border-2 border-neutral bg-base-100">
			{/* Header */}
			<div class="bg-base-content text-base-100 px-4 py-2 flex items-center justify-between">
				<p class="font-display font-bold text-sm">STATE RADIO</p>
				<span class="badge badge-error animate-pulse text-xs font-bold">
					ON AIR
				</span>
			</div>

			{/* Headline */}
			<div class="p-6">
				<p class="font-display text-2xl leading-tight min-h-24 flex items-center">
					{`"${HEADLINES[index]}"`}
				</p>
			</div>

			{/* Controls */}
			<div class="border-t-2 border-neutral px-4 py-3 space-y-2">
				<div class="flex gap-2">
					<button
						class="btn btn-primary btn-lg flex-1"
						onClick={prev}
					>
						◀ PREV
					</button>
					<button
						class="btn btn-primary btn-lg flex-1"
						onClick={next}
					>
						NEXT ▶
					</button>
				</div>
				<div class="text-center text-sm font-mono font-bold">
					{`${String(index + 1).padStart(2, "0")} / ${String(HEADLINES.length).padStart(2, "0")}`}
				</div>
			</div>
		</div>
	);
}
