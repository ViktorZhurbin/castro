import { MenuIcon } from "./icons/MenuIcon.tsx";

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
			class={`btn btn-ghost btn-sm font-medium lg:hidden p-0 ${labelClass || ""}`}
			aria-label={ariaLabel}
		>
			<MenuIcon />
			Menu
		</label>
	);
}
