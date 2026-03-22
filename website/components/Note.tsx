import type { ComponentChildren } from "preact";

interface Props {
	children: ComponentChildren;
	className?: string;
}

export function Note({ children, className = "" }: Props) {
	return (
		<div
			className={`border-l-4 border-primary bg-base-200 px-4 py-3 text-sm text-base-content ${className}`}
		>
			{children}
		</div>
	);
}
