import { HomeIcon } from "./icons/HomeIcon.tsx";
import ThemeToggle from "./ThemeToggle.island.tsx";

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 bg-neutral text-neutral-content border-b-2 border-secondary/30">
			<div className="max-w-6xl mx-auto px-6 h-12 flex items-center">
				<a href="/" className="btn btn-ghost btn-sm btn-square mr-auto" aria-label="Home">
					<HomeIcon />
				</a>
				<ThemeToggle lenin:awake />
			</div>
		</header>
	);
};
