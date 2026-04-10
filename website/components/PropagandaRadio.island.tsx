import { useEffect, useState } from "preact/hooks";
import "./PropagandaRadio.css";

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
		<div class="propaganda-radio">
			{/* Header */}
			<div class="propaganda-radio-header">
				<p>STATE RADIO</p>
				<span class="badge badge-error on-air-badge">ON AIR</span>
			</div>

			{/* Headline */}
			<div class="propaganda-radio-headline">
				<p>{`"${HEADLINES[index]}"`}</p>
			</div>

			{/* Controls */}
			<div class="propaganda-radio-controls">
				<div class="propaganda-radio-buttons">
					<button onClick={prev}>◀ PREV</button>
					<button onClick={next}>NEXT ▶</button>
				</div>
				<div class="propaganda-radio-counter">
					{`${String(index + 1).padStart(2, "0")} / ${String(HEADLINES.length).padStart(2, "0")}`}
				</div>
			</div>
		</div>
	);
}
