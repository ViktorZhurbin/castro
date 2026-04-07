interface FeatureCardProps {
	title: string;
	description: string;
	href: string;
	external?: boolean;
	color?: "primary" | "secondary" | "accent";
}

const topBorderColor = {
	primary: "border-t-primary",
	secondary: "border-t-secondary",
	accent: "border-t-accent",
};

export function FeatureCard({
	title,
	description,
	href,
	external,
	color = "primary",
}: FeatureCardProps) {
	const linkProps = external ? { target: "_blank", rel: "noopener" } : {};

	return (
		<a
			{...linkProps}
			href={href}
			class={`card bg-base-100 border-2 border-base-content border-t-8 ${topBorderColor[color]} hover:bg-base-200 transition-colors`}
		>
			<div class="card-body">
				<h3 class="card-title font-display text-2xl text-base-content">
					{title}
				</h3>
				<p class="text-base-content/80">{description}</p>
			</div>
		</a>
	);
}
