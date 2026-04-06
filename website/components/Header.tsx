import { StarIcon } from "./icons/StarIcon.tsx";
import ThemeToggle from "./ThemeToggle.tsx";

export const Header = ({ activePath }: { activePath?: string }) => {
	const isHowItWorks = activePath?.startsWith("/how-it-works");
	const isGuide = activePath?.startsWith("/guide");
	const isReference = activePath?.startsWith("/reference");

	return (
		<header class="navbar sticky top-0 z-50 bg-base-100 border-b border-base-content/40 min-h-12">
			<div class="flex items-center flex-1 justify-start">
				<a
					href="/"
					class="btn btn-square btn-primary btn-ghost btn-sm"
					aria-label="Home"
				>
					<StarIcon />
				</a>
				<a
					href="/guide/quick-start"
					class={`btn btn-ghost btn-sm font-display text-sm ${isGuide ? "btn-active" : ""}`}
				>
					GUIDE
				</a>
				<a
					href="/how-it-works"
					class={`btn btn-ghost btn-sm font-display text-sm ${isHowItWorks ? "btn-active" : ""}`}
				>
					HOW IT WORKS
				</a>
				<a
					href="/reference/config"
					class={`btn btn-ghost btn-sm font-display text-sm ${isReference ? "btn-active" : ""}`}
				>
					REFERENCE
				</a>
			</div>
			<div class="flex items-center justify-end">
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
};
