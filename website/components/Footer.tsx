export function Footer() {
	return (
		<footer class="footer footer-center footer-horizontal sm:footer-vertical bg-base-300 py-8 px-6 pb-16 border-t-2 border-primary">
			<div>
				<p class="font-display text-3xl text-secondary">
					WORKERS OF THE WEB, UNITE!
				</p>
				<p class="font-display text-xl text-base-content/80">
					SEIZE THE MEANS OF RENDERING.
				</p>
			</div>
			<nav class="flex gap-8 text-sm font-bold uppercase tracking-wide">
				<a href="/about" class="link link-hover">
					About
				</a>
				<a
					href="https://github.com/ViktorZhurbin/castro"
					target="_blank"
					rel="noopener"
					class="link link-hover"
				>
					GitHub
				</a>
			</nav>
			<p class="text-base-content/80 text-xs">
				Built with Castro | The People's Framework
			</p>
		</footer>
	);
}
