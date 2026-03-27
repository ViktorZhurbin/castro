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

	useEffect(() => {
		const id = setInterval(() => {
			setIndex((i) => (i + 1) % HEADLINES.length);
		}, 3000);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="bg-neutral text-neutral-content rounded-lg p-5 relative">
			<span className="badge badge-error animate-pulse absolute top-3 right-3 text-xs font-bold">
				ON AIR
			</span>
			<p className="text-xs opacity-60 mb-1 font-display">STATE RADIO</p>
			<p className="font-display text-xl min-h-[3.5rem] flex items-center">
				{HEADLINES[index]}
			</p>
		</div>
	);
}
