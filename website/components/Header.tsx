import { MoreIcon } from "./icons/MoreIcon.tsx";
import { StarIcon } from "./icons/StarIcon.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";
import "./Header.css";

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
		<header class="navbar">
			<div class="flex">
				<a href="/" class="c-btn-square c-btn-square-primary" aria-label="Home">
					<StarIcon />
				</a>

				{/* Desktop nav */}
				<nav>
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							class={link.active ? "active" : ""}
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Mobile dropdown */}
				<details class="dropdown">
					<summary
						class="c-btn-square c-btn-square-base"
						aria-label="Open menu"
					>
						<MoreIcon />
					</summary>
					<ul class="dropdown-content menu">
						{navLinks.map((link) => (
							<li key={link.href}>
								<a href={link.href} class={link.active ? "active" : ""}>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</details>
			</div>
			<div>
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
}
