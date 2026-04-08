export function Footer() {
	return (
		<footer class="bg-base-300 pb-20 md:pb-12 pt-12 px-6 border-t-4 border-primary">
			<div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
				{/* Slogan locked hard left */}
				<div>
					<p class="font-display text-4xl md:text-5xl text-base-content leading-none">
						WORKERS OF THE WEB, UNITE!
					</p>
					<p class="font-display text-xl md:text-2xl text-base-content/70 mt-2 leading-none">
						SEIZE THE MEANS OF RENDERING.
					</p>
				</div>

				{/* Utilities anchored right */}
				<div class="flex flex-col md:items-end gap-4">
					<nav class="flex gap-6 text-sm font-bold uppercase tracking-wide">
						<a href="/about" class="hover:text-primary transition-colors">
							About
						</a>
						<a
							href="https://github.com/ViktorZhurbin/castro"
							target="_blank"
							rel="noopener"
							class="hover:text-primary transition-colors"
						>
							GitHub
						</a>
					</nav>
					<p class="text-base-content/70 text-xs font-medium md:text-right">
						Built with Castro <br class="hidden md:block" />
						The People's Framework
					</p>
				</div>
			</div>
		</footer>
	);
}
