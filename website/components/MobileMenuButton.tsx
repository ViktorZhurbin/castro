interface MobileMenuButtonProps {
	htmlFor: string;
	ariaLabel: string;
	labelClass?: string;
}

export function MobileMenuButton({
	htmlFor,
	ariaLabel,
	labelClass,
}: MobileMenuButtonProps) {
	return (
		<label
			htmlFor={htmlFor}
			class={`btn btn-ghost btn-sm font-medium lg:hidden ${labelClass || ""}`}
			aria-label={ariaLabel}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
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
