import { MoreIcon } from "./icons/MoreIcon.tsx";
import { StarIcon } from "./icons/StarIcon.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

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
		<header class="navbar sticky top-0 z-50 bg-base-100 border-b-2 border-neutral min-h-12 px-4 py-0">
			<div class="flex items-center flex-1 justify-start gap-2">
				<a href="/" class="c-btn-square c-btn-square-primary" aria-label="Home">
					<StarIcon />
				</a>

				{/* Desktop nav */}
				<nav class="hidden sm:flex items-center gap-6 ml-6">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							class={`font-display text-xl transition-none border-b-4 ${
								link.active
									? "border-primary text-primary"
									: "border-transparent text-base-content hover:border-neutral"
							}`}
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Mobile dropdown */}
				<details class="dropdown sm:hidden">
					<summary
						class="c-btn-square c-btn-square-base"
						aria-label="Open menu"
					>
						<MoreIcon />
					</summary>
					{/* Heavy borders for the dropdown menu */}
					<ul class="dropdown-content menu z-50 w-52 p-2">
						{navLinks.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									class={`font-display text-lg ${
										link.active
											? "bg-primary text-primary-content"
											: "hover:bg-neutral hover:text-neutral-content"
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
