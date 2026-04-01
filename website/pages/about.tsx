import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = { title: "About — Castro" };

export default function About() {
	return (
		<section className="flex-1 py-24 px-6 bg-base-200">
			<div className="max-w-3xl mx-auto">
				<h1 className="font-display text-5xl md:text-7xl text-primary">
					ABOUT
				</h1>
				<div className="divider divider-primary max-w-xs" />
				<h2 className="font-display text-2xl md:text-3xl text-secondary mb-8">
					WHY IT EXISTS
				</h2>

				<p className="mb-6">
					Existing static site generators felt like they were either too
					implicit or too heavy. The gap between "I want a fast static site" and
					"I want to understand how island architecture actually works" had no
					good answer — so Castro started as a learning project that became a
					working framework.
				</p>

				<p className="mb-10">
					Every design decision traces back to a specific frustration. JSX and
					TypeScript everywhere, because implicit template magic obscures what's
					happening. ~1,300 lines total, because a codebase you can read in an
					afternoon teaches more than one you have to trust.
				</p>

				<p className="mb-10">
					The communist theme makes it memorable. The lessons are real.
				</p>

				<div className="flex flex-wrap gap-4">
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
						className="btn btn-lg btn-primary"
					>
						VIEW SOURCE
					</a>
					<a
						href="/how-it-works"
						className="btn btn-lg btn-outline btn-primary"
					>
						HOW IT WORKS
					</a>
				</div>
			</div>
		</section>
	);
}
