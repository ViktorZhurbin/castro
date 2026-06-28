import "./HowItWorks.css";

const items = [
	{
		title: "JSX → STATIC HTML",
		description:
			"Pages are Preact components. Bun builds them. No JavaScript shipped to the browser by default.",
	},
	{
		title: "ISLANDS HYDRATE ON DEMAND",
		description:
			"Name a file .island.tsx. Castro marks it at build time; the browser hydrates it when it scrolls into view.",
	},
	{
		title: "SOURCE = DOCUMENTATION",
		description:
			"Every module can fit in your head. Comments explain the decisions, not the mechanics.",
	},
];

export function HowItWorks() {
	return (
		<section class="how-it-works-section">
			<div class="container">
				<p class="how-it-works-label">HOW IT WORKS</p>
				<div class="how-it-works-list">
					{items.map((item, i) => (
						<div class="how-it-works-item">
							<p class="how-it-works-num">{String(i + 1).padStart(2, "0")}</p>
							<div class="how-it-works-body">
								<p class="how-it-works-item-title">{item.title}</p>
								<p class="how-it-works-item-desc">{item.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
