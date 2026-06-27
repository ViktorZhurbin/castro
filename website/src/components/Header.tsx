import { GithubIcon } from "./icons/GithubIcon";
import { StarIcon } from "./icons/StarIcon";
import { ThemeToggle } from "./theme/ThemeToggle";
import "./Header.css";

export function Header() {
	return (
		<header class="navbar">
			<div class="navbar-start">
				<a href="/" class="btn-square btn-square-primary" aria-label="Home">
					<StarIcon />
				</a>
			</div>

			<div class="navbar-end">
				<a class="btn-square" href="https://github.com/ViktorZhurbin/castro">
					<GithubIcon />
				</a>
				<ThemeToggle />
			</div>
		</header>
	);
}
