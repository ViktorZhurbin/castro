import "./AlsoIncluded.css";

export function AlsoIncluded() {
	return (
		<>
			<div class="also-included-divider">ALSO INCLUDED</div>
			<div class="also-included-grid">
				<AlsoIncludedItem
					title="BUN-NATIVE"
					description="No Webpack, no Vite. Built on Bun's build pipeline from the ground up."
					colorVar="--pico-secondary"
				/>
				<AlsoIncludedItem
					title="PLUGIN SYSTEM"
					description="Tailwind, custom frameworks, asset injection. The core stays small."
					colorVar="--pico-accent"
				/>
				<AlsoIncludedItem
					title="READABLE BY DESIGN"
					description="Every file explains why. Read the source, understand the system."
					colorVar="--pico-primary"
				/>
			</div>
		</>
	);
}

function AlsoIncludedItem(props: {
	title: string;
	description: string;
	colorVar: string;
}) {
	return (
		<div
			class="also-included-item"
			style={{ borderLeftColor: `var(${props.colorVar})` }}
		>
			<h3>{props.title}</h3>
			<p>{props.description}</p>
		</div>
	);
}
