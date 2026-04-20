import { navSections } from "@/nav";
import { GithubIcon } from "./icons/GithubIcon";
import { MoreIcon } from "./icons/MoreIcon";
import { StarIcon } from "./icons/StarIcon";
import { ThemeToggle } from "./theme/ThemeToggle";
import "./Header.css";

export function Header({ activePath }: { activePath?: string }) {
	const navLinks = navSections.map(({ key, title, href }) => {
		const isActive = !!key && activePath?.startsWith(`/${key}`);

		return (
			<li key={href}>
				<a
					href={href}
					class={isActive ? "active" : undefined}
					aria-current={isActive ? "page" : undefined}
				>
					{title.toUpperCase()}
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

			<div class="navbar-end">
				<a class="btn-square" href="https://github.com/ViktorZhurbin/castro">
					<GithubIcon />
				</a>
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
}
