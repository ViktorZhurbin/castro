import type { PageMeta } from "@vktrz/castro";
import BuildPipeline from "../../components/BuildPipeline.island.tsx";

export const meta: PageMeta = { title: "Build Pipeline — Castro Tutorial" };

export default function Tutorial() {
	return (
		<section className="py-16 px-6 bg-base-100">
			<div className="max-w-4xl mx-auto">
				<h1 className="font-display text-5xl md:text-7xl text-secondary mb-4">
					THE BUILD PIPELINE
				</h1>
				<p className="text-base-content/70 max-w-2xl mb-12">
					Castro compiles your pages and islands at build time. Pages become
					static HTML. Islands get their own JS bundles for client-side
					hydration. The factory splits them apart.
				</p>

				<BuildPipeline comrade:visible />

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							1. INPUT
						</h3>
						<p className="text-base-content/70 text-sm">
							Your pages (.tsx, .md) and island components (.island.tsx) enter
							the pipeline. Everything starts as source code.
						</p>
					</div>
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							2. COMPILE
						</h3>
						<p className="text-base-content/70 text-sm">
							Bun.build processes each file. Pages render to HTML. Islands are
							intercepted by the marker plugin and compiled separately for both
							server and client.
						</p>
					</div>
					<div>
						<h3 className="font-display text-2xl text-primary mb-2">
							3. OUTPUT
						</h3>
						<p className="text-base-content/70 text-sm">
							Static HTML files ship immediately. Island JS bundles load on
							demand via the hydration directive — visible, awake, or never.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
