import { createSignal } from "@vktrz/castro/signals";

const HEADLINES = [
	"Harvest exceeds expectations by 400%",
	"Framework stability improved by decree",
	"Virtual DOM dissidents sent to re-education",
	"Bundle sizes redistributed equally",
	"Hydration deemed mandatory for all components",
	"Central Committee approves new CSS standard",
];

export default function PropagandaRadio() {
	const [index, setIndex] = createSignal(0);

	// bare-jsx component functions run once — no lifecycle hooks needed.
	// The interval persists for the lifetime of the page.
	setInterval(() => {
		setIndex((i) => (i + 1) % HEADLINES.length);
	}, 3000);

	return (
		<div class="bg-neutral text-neutral-content rounded-lg p-5 relative">
			<span class="badge badge-error animate-pulse absolute top-3 right-3 text-xs font-bold">
				ON AIR
			</span>
			<p class="text-xs opacity-60 mb-1 font-display">STATE RADIO</p>
			<p class="font-display text-xl min-h-[3.5rem] flex items-center">
				{() => HEADLINES[index()]}
			</p>
		</div>
	);
}
