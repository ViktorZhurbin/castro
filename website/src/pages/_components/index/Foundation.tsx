import "./Foundation.css";

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
		title: "THE SOURCE IS THE DOCUMENTATION",
		description:
			"~1,300 lines. Module docblocks explain the architecture. No separate docs site.",
	},
];

export function Foundation() {
	return (
		<section class="foundation-section">
			<div class="container">
				<p class="foundation-label">THE FOUNDATION</p>
				<div class="foundation-list">
					{items.map((item, i) => (
						<div class="foundation-item">
							<p class="foundation-num">{String(i + 1).padStart(2, "0")}</p>
							<div class="foundation-body">
								<p class="foundation-item-title">{item.title}</p>
								<p class="foundation-item-desc">{item.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
