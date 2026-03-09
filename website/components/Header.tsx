import { HomeIcon } from "./icons/HomeIcon.tsx";
import ThemeToggle from "./ThemeToggle.island.tsx";

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 bg-base-100 border-b-2 border-primary [--noise:0]">
			<div className="max-w-6xl mx-auto px-6 h-12 flex items-center">
				<a
					href="/"
					className="btn btn-ghost btn-sm mr-auto gap-1"
					aria-label="Home"
				>
					<HomeIcon className="w-5 h-5" />
					<span className="font-display text-lg leading-none translate-y-px">
						CASTRO
					</span>
				</a>
				<ThemeToggle lenin:awake />
			</div>
		</header>
	);
};
