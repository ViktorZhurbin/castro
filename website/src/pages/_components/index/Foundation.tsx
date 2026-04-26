import "./Foundation.css";

const items = [
	{
		title: "READABLE BY DESIGN",
		description:
			"Every file explains why. Read the source, understand the system.",
	},
	{
		title: "SMALL ON PURPOSE",
		description:
			"~1,600 lines of executable code. Small enough to read in an afternoon",
	},
	{
		title: "A REAL WORKING SSG",
		description:
			"Not a stub for a tutorial. Build something with it if you want.",
	},
];

export function Foundation() {
	return (
		<section class="foundation-section">
			<div class="container">
				<p class="foundation-label">THE FOUNDATION</p>
				<div class="foundation-grid">
					{items.map((item) => (
						<div class="foundation-item">
							<p>{item.title}</p>
							<p>{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
