import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = { title: "About — Castro" };

export default function About() {
	return (
		<section className="pt-16 pb-10 px-6 bg-base-100">
			<div className="max-w-3xl mx-auto">
				<h1 className="font-display text-5xl md:text-7xl text-primary mb-8">
					ABOUT
				</h1>

				<p className="text-base-content mb-6">
					Castro is a working Static Site Generator that implements island
					architecture in ~1,300 lines of well-commented, readable code. Island
					architecture is how modern frameworks like Astro, Marko, and Fresh
					achieve great performance — instead of shipping JavaScript for your
					entire page, you selectively hydrate only the interactive components.
					The rest stays as static HTML. Castro shows you exactly how this works
					by implementing it from scratch.
				</p>

				<p className="text-base-content mb-8">
					The communist theme makes it memorable. The architecture lessons are
					real. Every file in the codebase has comments explaining not just{" "}
					<em>what</em> it does, but <em>why</em> and <em>how</em>. The goal is
					to learn by reading code, not documentation.
				</p>

				<div className="flex flex-wrap gap-4">
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
						className="btn btn-primary"
					>
						VIEW SOURCE
					</a>
					<a href="/how-it-works/build" className="btn btn-outline btn-primary">
						HOW IT WORKS
					</a>
				</div>
			</div>
		</section>
	);
}
