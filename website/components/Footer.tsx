import type { FunctionComponent } from "preact";

/**
 * Castro website footer with slogan and links.
 */
export const Footer: FunctionComponent = () => {
	return (
		<footer className="footer footer-center bg-neutral text-neutral-content p-10">
			<div>
				<p className="text-2xl font-bold text-primary tracking-wide">
					Workers of the Web, Unite!
					<br />
					Seize the Means of Rendering.
				</p>
			</div>
			<nav className="flex gap-8">
				<a href="/about" className="link link-hover">
					About
				</a>
				<a
					href="https://github.com/vktrz/castro"
					target="_blank"
					rel="noopener"
					className="link link-hover"
				>
					GitHub
				</a>
			</nav>
			<p className="opacity-60 text-sm">
				Built with Castro | The People's Framework
			</p>
		</footer>
	);
};
