interface FeatureCardProps {
	title: string;
	description: string;
	href: string;
	external?: boolean;
}

export const FeatureCard = ({
	title,
	description,
	href,
	external,
}: FeatureCardProps) => {
	const linkProps = external ? { target: "_blank", rel: "noopener" } : {};

	return (
		<a
			href={href}
			{...linkProps}
			className="card card-border border-base-content/20 bg-base-100 shadow-md hover:shadow-lg hover:border-primary transition-all"
		>
			<div className="card-body">
				<h3 className="card-title font-display text-2xl text-primary">
					{title}
				</h3>
				<p className="text-base-content/80">{description}</p>
			</div>
		</a>
	);
};
