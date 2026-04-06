import { MenuIcon } from "./icons/MenuIcon.tsx";
import { StarIcon } from "./icons/StarIcon.tsx";
import ThemeToggle from "./ThemeToggle.tsx";

export const Header = ({ activePath }: { activePath?: string }) => {
	const isHowItWorks = activePath?.startsWith("/how-it-works");
	const isGuide = activePath?.startsWith("/guide");
	const isReference = activePath?.startsWith("/reference");

	const navLinks = [
		{ href: "/guide/quick-start", label: "GUIDE", active: isGuide },
		{ href: "/how-it-works", label: "HOW IT WORKS", active: isHowItWorks },
		{ href: "/reference/config", label: "REFERENCE", active: isReference },
	];

	return (
		<header class="navbar sticky top-0 z-50 bg-base-100 border-b border-base-content/40 min-h-12">
			<div class="flex items-center flex-1 justify-start gap-2">
				<a
					href="/"
					class="btn btn-square btn-primary btn-ghost btn-sm"
					aria-label="Home"
				>
					<StarIcon />
				</a>

				{/* Desktop nav */}
				<nav class="hidden sm:flex items-center">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							class={`btn btn-ghost btn-sm font-display text-sm ${link.active ? "btn-active" : ""}`}
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Mobile dropdown */}
				<details class="dropdown sm:hidden">
					<summary
						class="btn btn-ghost btn-square btn-sm"
						aria-label="Open menu"
					>
						<MenuIcon />
					</summary>
					<ul class="dropdown-content menu bg-base-100 border border-base-content/20 rounded-box z-50 w-48 p-2 shadow-md mt-1">
						{navLinks.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									class={`font-display text-sm ${link.active ? "menu-active" : ""}`}
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</details>
			</div>
			<div class="flex items-center justify-end">
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
};
