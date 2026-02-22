import type { ComponentChildren } from "preact";

const cardStyles = {
	neutral: { card: "border-neutral", title: "text-neutral" },
	primary: { card: "border-primary", title: "text-primary" },
	accent: { card: "border-accent", title: "text-accent" },
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
		<div className={`card card-border ${styles.card} bg-base-100`}>
			<div className="card-body">
				<h3 className={`card-title text-2xl ${styles.title}`}>{name}</h3>
				<p className="italic text-sm opacity-60">{slogan}</p>
				<p>{description}</p>
				<div className="bg-base-200 p-4 rounded-box">
					{children}
				</div>
				<p className="text-sm italic opacity-50">{note}</p>
			</div>
		</div>
	);
};
