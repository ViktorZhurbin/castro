export const meta = { title: "About - Castro" };

export default function About() {
	return (
		<section class="flex-1 py-24 px-6 bg-base-200">
			<div class="max-w-3xl mx-auto">
				<h1 class="font-display text-5xl md:text-7xl text-primary">ABOUT</h1>
				<div class="divider divider-primary max-w-xs" />
				<h2 class="font-display text-2xl md:text-3xl text-secondary mb-8">
					WHY IT EXISTS
				</h2>

				<p class="mb-6">
					Castro started as a learning project that became a working framework.
					Existing static site generators were either too implicit or too heavy
					- the gap between "I want a fast static site" and "I want to
					understand how island architecture actually works" had no good answer.
				</p>

				<p class="mb-10">
					Every design decision traces back to a specific frustration. JSX and
					TypeScript everywhere, because implicit template magic obscures what's
					happening. Small enough to read in an afternoon, because a codebase
					you can understand beats one you can only trust.
				</p>

				<p class="mb-10">
					The communist theme makes it memorable. The lessons are real.
				</p>

				<div class="flex flex-wrap gap-4">
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
						class="btn btn-lg btn-primary"
					>
						VIEW SOURCE
					</a>
					<a href="/how-it-works" class="btn btn-lg btn-outline btn-primary">
						HOW IT WORKS
					</a>
				</div>
			</div>
		</section>
	);
}
