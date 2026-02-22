/**
 * Castro website footer with slogan and links.
 */
export const Footer = () => {
	return (
		<footer className="footer footer-center bg-accent text-accent-content p-10">
			<div>
				<p className="font-display text-3xl tracking-wide text-primary">
					WORKERS OF THE WEB, UNITE!
				</p>
				<p className="font-display text-xl tracking-wide text-primary/80">
					SEIZE THE MEANS OF RENDERING.
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
			<p className="text-accent-content/70 text-sm">
				Built with Castro | The People's Framework
			</p>
		</footer>
	);
};
