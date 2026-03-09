import type { PageMeta } from "@vktrz/castro";
import BuildPipeline from "../../components/BuildPipeline.island.tsx";

export const meta: PageMeta = { title: "Build Pipeline — Castro Tutorial" };

export default function Tutorial() {
	return (
		<section className="py-16 px-6 bg-base-100">
			{/* Pipeline diagram + description — both pinned by ScrollTrigger
			    during the scroll animation. Uses lenin:awake so GSAP
			    initializes before the user scrolls past. */}
			<div className="max-w-4xl mx-auto">
				<BuildPipeline lenin:awake />
			</div>

			<div className="max-w-4xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							1. INPUT
						</h3>
						<p className="text-base-content text-sm">
							Your pages (.tsx, .md) and island components (.island.tsx) enter
							the pipeline. Everything starts as source code.
						</p>
					</div>
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							2. COMPILE
						</h3>
						<p className="text-base-content text-sm">
							Bun.build processes each file. Pages render to HTML. Islands are
							intercepted by the marker plugin and compiled separately for both
							server and client.
						</p>
					</div>
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							3. OUTPUT
						</h3>
						<p className="text-base-content text-sm">
							Static HTML files ship immediately. Island JS bundles load on
							demand via the hydration directive — visible, awake, or never.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
