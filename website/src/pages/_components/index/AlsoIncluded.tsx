import "./AlsoIncluded.css";

const items = [
	{
		title: "READABLE BY DESIGN",
		description:
			"Every file explains why. Read the source, understand the system.",
	},
	{
		title: "BUN-NATIVE",
		description:
			"No Webpack, no Vite. Built on Bun's build pipeline from the ground up.",
	},
	{
		title: "PLUGIN SYSTEM",
		description:
			"Tailwind, custom frameworks, asset injection. The core stays small.",
	},
];

export function AlsoIncluded() {
	return (
		<section class="also-included">
			<div class="container">
				<p class="also-included-label">THE DOCTRINE</p>
				<div class="also-included-grid">
					{items.map((item) => (
						<div class="also-included-item">
							<p class="also-included-title">{item.title}</p>
							<p class="also-included-body">{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
