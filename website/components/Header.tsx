import { MenuIcon } from "./icons/MenuIcon.tsx";
import { StarIcon } from "./icons/StarIcon.tsx";
import ThemeToggle from "./ThemeToggle.tsx";

export function Header({ activePath }: { activePath?: string }) {
	const isHowItWorks = activePath?.startsWith("/how-it-works");
	const isGuide = activePath?.startsWith("/guide");
	const isReference = activePath?.startsWith("/reference");

	const navLinks = [
		{ href: "/guide/quick-start", label: "GUIDE", active: isGuide },
		{ href: "/how-it-works", label: "HOW IT WORKS", active: isHowItWorks },
		{ href: "/reference/config", label: "REFERENCE", active: isReference },
	];

	return (
		<header class="navbar sticky top-0 z-50 bg-base-100 border-b-2 border-base-content min-h-12 px-4">
			<div class="flex items-center flex-1 justify-start gap-2">
				<a
					href="/"
					class="btn btn-ghost btn-square btn-sm text-primary hover:bg-primary/10"
					aria-label="Home"
				>
					<StarIcon />
				</a>

				{/* Desktop nav */}
				<nav class="hidden sm:flex items-center gap-1 ml-2">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							class={`btn btn-sm font-display text-lg border-none shadow-none border-b-2 transition-none ${
								link.active
									? "bg-primary text-primary-content border-b-primary"
									: "bg-transparent text-base-content border-b-transparent hover:border-b-base-content hover:bg-transparent"
							}`}
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
					{/* Heavy borders for the dropdown menu */}
					<ul class="dropdown-content bg-base-100 border-4 border-base-content z-50 w-48 p-2 shadow-none mt-2 flex flex-col gap-1">
						{navLinks.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									class={`block px-4 py-2 font-display text-lg ${
										link.active
											? "bg-primary text-primary-content"
											: "hover:bg-base-content hover:text-base-100"
									}`}
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
}
