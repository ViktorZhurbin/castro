import type { ComponentChildren } from "preact";

const cardStyles = {
	neutral: { card: "border-base-content/40", title: "text-base-content" },
	primary: { card: "border-primary", title: "text-primary" },
	secondary: { card: "border-secondary", title: "text-secondary" },
} as const;

interface DirectiveCardProps {
	name: string;
	slogan: string;
	description: string;
	note: string;
	color: keyof typeof cardStyles;
	children: ComponentChildren;
}

export const DirectiveCard = ({
	name,
	slogan,
	description,
	note,
	color,
	children,
}: DirectiveCardProps) => {
	const styles = cardStyles[color];
	return (
		<div className={`card card-border ${styles.card} bg-base-100 shadow-md`}>
			<div className="card-body">
				<h3
					className={`card-title font-display text-3xl tracking-wide ${styles.title}`}
				>
					{name}
				</h3>
				<p className="italic text-sm text-base-content/70">{slogan}</p>
				<p className="mt-2 text-base-content">{description}</p>
				<div className="bg-base-200 p-4 mt-2 border border-dashed border-base-300">
					{children}
				</div>
				<p className="text-xs text-base-content/70 mt-2">{note}</p>
			</div>
		</div>
	);
};
