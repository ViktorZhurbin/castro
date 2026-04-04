interface FeatureCardProps {
	title: string;
	description: string;
	href: string;
	external?: boolean;
	color?: "primary" | "secondary" | "accent";
}

const textColor = {
	primary: "text-primary",
	secondary: "text-secondary",
	accent: "text-accent",
};

const borderColor = {
	primary: "hover:border-primary",
	secondary: "hover:border-secondary",
	accent: "hover:border-accent",
};

export const FeatureCard = ({
	title,
	description,
	href,
	external,
	color = "primary",
}: FeatureCardProps) => {
	const linkProps = external ? { target: "_blank", rel: "noopener" } : {};

	return (
		<a
			href={href}
			{...linkProps}
			class={`card card-border border-base-300 bg-base-100 ${borderColor[color]} transition-colors`}
		>
			<div class="card-body">
				<h3 class={`card-title font-display text-2xl ${textColor[color]}`}>
					{title}
				</h3>
				<p>{description}</p>
			</div>
		</a>
	);
};
