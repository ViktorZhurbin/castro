import "./InteractivitySpectrum.css";

export function InteractivitySpectrum() {
	return (
		<div class="spectrum-grid">
			<h3>THE INTERACTIVITY SPECTRUM</h3>
			<p>
				Each level adds capability and ships more JavaScript. The right choice
				is the lowest level that meets your needs.
			</p>
			<div class="spectrum-cards">
				<SpectrumCard
					level="01"
					title="STATIC"
					js="0 bytes"
					body="JSX rendered to HTML at build time."
					colorVar="--pico-primary"
				/>
				<SpectrumCard
					level="02"
					title="CLIENT SCRIPT"
					js="one function"
					body="DOM access without a framework runtime."
					colorVar="--pico-secondary"
				/>
				<SpectrumCard
					level="03"
					title="VANILLA ISLAND"
					js="your code only"
					body="Full island lifecycle, no framework cost."
					colorVar="--pico-accent"
				/>
				<SpectrumCard
					level="04"
					title="FRAMEWORK ISLAND"
					js="your code + runtime"
					body="Reactive state when you need it."
					colorVar="--pico-primary"
				/>
			</div>
		</div>
	);
}

interface SpectrumCardProps {
	level: string;
	title: string;
	js: string;
	body: string;
	colorVar: string;
}

function SpectrumCard({ level, title, js, body, colorVar }: SpectrumCardProps) {
	return (
		<div class="spectrum-card" style={{ borderTopColor: `var(${colorVar})` }}>
			<span class="spectrum-card-level">{level}</span>
			<p class="spectrum-card-title">{title}</p>
			<span class="spectrum-card-js">js: {js}</span>
			<p>{body}</p>
		</div>
	);
}
