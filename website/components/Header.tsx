import { MoreIcon } from "./icons/MoreIcon.tsx";
import { StarIcon } from "./icons/StarIcon.tsx";
import { ThemeToggle } from "./theme/ThemeToggle.tsx";
import "./Header.css";

export function Header({ activePath }: { activePath?: string }) {
	const navLinks = [
		{ href: "/guide/quick-start", label: "GUIDE" },
		{ href: "/how-it-works", label: "HOW IT WORKS" },
		{ href: "/reference/config", label: "REFERENCE" },
	].map((link) => {
		const [, pathRoot] = link.href.split("/");
		const isActive = !!pathRoot && activePath?.startsWith(`/${pathRoot}`);

		return (
			<li key={link.href}>
				<a
					href={link.href}
					class={isActive ? "active" : undefined}
					aria-current={isActive ? "page" : undefined}
				>
					{link.label}
				</a>
			</li>
		);
	});

	return (
		<header class="navbar">
			<div class="navbar-start">
				<a href="/" class="btn-square btn-square-primary" aria-label="Home">
					<StarIcon />
				</a>

				<nav class="desktop-nav">
					<ul>{navLinks}</ul>
				</nav>

				<details class="dropdown">
					<summary role="button" class="btn-square" aria-label="Open menu">
						<MoreIcon />
					</summary>
					<ul class="menu">{navLinks}</ul>
				</details>
			</div>
			<div>
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
}
