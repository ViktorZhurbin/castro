import "./InteractivitySpectrum.css";

export function InteractivitySpectrum() {
	return (
		<div class="container">
			<div class="spectrum-section-header">
				<h2>BUILT FOR CLARITY</h2>
				<p>
					A working static site generator you can read in an afternoon and
					understand completely.
				</p>
			</div>

			<div class="spectrum-grid">
				<h3>THE INTERACTIVITY SPECTRUM</h3>
				<p>
					Each level adds capability and ships more JavaScript. The right choice
					is the lowest level that meets your needs.
				</p>
				<SpectrumCards />
			</div>
		</div>
	);
}

function SpectrumCards() {
	return (
		<div class="spectrum-cards">
			<SpectrumCard
				level="01"
				title="STATIC"
				js="Zero JS"
				body="JSX rendered to HTML at build time."
				weight={1}
			/>
			<SpectrumCard
				level="02"
				title="CLIENT SCRIPT"
				js="one function"
				body="DOM access without a framework runtime."
				weight={2}
			/>
			<SpectrumCard
				level="03"
				title="VANILLA ISLAND"
				js="your code only"
				body="Full island lifecycle, no framework cost."
				weight={3}
			/>
			<SpectrumCard
				level="04"
				title="FRAMEWORK ISLAND"
				js="your code + runtime"
				body="Reactive state when you need it."
				weight={4}
			/>
		</div>
	);
}

interface SpectrumCardProps {
	level: string;
	title: string;
	js: string;
	body: string;
	weight: number;
}

function SpectrumCard({ level, title, js, body, weight }: SpectrumCardProps) {
	return (
		<div class="spectrum-card">
			<span class="spectrum-card-level">{level}</span>
			<p class="spectrum-card-title">{title}</p>
			<p>{body}</p>

			<div class="spectrum-card-bottom">
				<div
					class="spectrum-card-meter"
					role="img"
					aria-label={`JS weight: ${weight} of 4`}
				>
					{[1, 2, 3, 4].map((i) => (
						<span class={i <= weight ? "on" : undefined} />
					))}
				</div>
				<div class="spectrum-card-meter-label">{js}</div>
			</div>
		</div>
	);
}
