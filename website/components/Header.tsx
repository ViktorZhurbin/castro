import ThemeToggle from "./castro-jsx/ThemeToggle.island.tsx";

export const Header = ({ activePath }: { activePath?: string }) => {
	const isHowItWorks = activePath?.startsWith("/how-it-works");
	const isGuide = activePath?.startsWith("/guide");

	return (
		<header class="navbar sticky top-0 z-50 bg-base-100 border-b border-base-content/40 min-h-12 px-6">
			<div class="navbar-start">
				<a href="/" class="btn btn-ghost btn-sm gap-1" aria-label="Home">
					<span class="font-display text-xl text-primary leading-none">
						CASTRO
					</span>
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
			</div>
			<div class="navbar-end gap-2">
				<ThemeToggle comrade:eager />
			</div>
		</header>
	);
};
