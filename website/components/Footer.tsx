import { StarIcon } from "./icons/StarIcon.tsx";

/**
 * Castro website footer with slogan and links.
 */
export const Footer = () => {
	return (
		<footer className="footer footer-center bg-base-300 py-16 px-6 border-t-2 border-primary">
			<div className="w-12 h-12 text-primary">
				<StarIcon />
			</div>
			<div>
				<p className="font-display text-3xl text-primary">
					WORKERS OF THE WEB, UNITE!
				</p>
				<p className="font-display text-xl text-base-content/60">
					SEIZE THE MEANS OF RENDERING.
				</p>
			</div>
			<nav className="flex gap-8 text-sm font-bold uppercase tracking-wide">
				<a href="/about" className="link link-hover">
					About
				</a>
				<a
					href="https://github.com/ViktorZhurbin/castro"
					target="_blank"
					rel="noopener"
					className="link link-hover"
				>
					GitHub
				</a>
			</nav>
			<p className="text-base-content/60 text-xs">
				Built with Castro | The People's Framework
			</p>
		</footer>
	);
};
