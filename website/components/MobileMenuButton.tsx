interface MobileMenuButtonProps {
	htmlFor: string;
	ariaLabel: string;
	className?: string;
}

export function MobileMenuButton({ htmlFor, ariaLabel, className }: MobileMenuButtonProps) {
	return (
		<label
			htmlFor={htmlFor}
			className={`btn btn-ghost btn-sm lg:hidden ${className || ""}`}
			aria-label={ariaLabel}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
			Menu
		</label>
	);
}
