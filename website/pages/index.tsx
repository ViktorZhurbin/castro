import type { PageMeta } from "@vktrz/castro";
import { FeatureCard } from "../components/FeatureCard.tsx";
import { StarIcon } from "../components/icons/StarIcon.tsx";

export const meta: PageMeta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />
			<Features />
			<HowItWorks />
		</>
	);
}

function Hero() {
	return (
		<div className="hero min-h-[calc(100vh-3rem)] bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-3xl">
					<div className="w-32 h-32 mx-auto mb-10 text-primary">
						<StarIcon />
					</div>
					<h1 className="font-display text-8xl md:text-9xl text-primary">
						CASTRO
					</h1>
					<p className="font-display text-3xl md:text-5xl mt-2 mb-6">
						THE PEOPLE'S FRAMEWORK
					</p>
					<div className="divider divider-primary max-w-xs mx-auto" />
					<p className="text-lg font-bold mb-1">
						Your Five-Year Plan to Learn Island Architecture
					</p>
					<p className="italic text-sm mb-10 text-base-content/80">
						"The satire is optional. The knowledge is real."
					</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<a href="/guide/quick-start" className="btn btn-lg btn-primary">
							GET STARTED
						</a>
						<a
							href="/how-it-works"
							className="btn btn-lg btn-outline btn-primary"
						>
							HOW IT WORKS
						</a>
						<a
							href="https://github.com/ViktorZhurbin/castro"
							target="_blank"
							rel="noopener"
							className="btn btn-lg btn-ghost"
						>
							VIEW SOURCE
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

function Features() {
	return (
		<section className="py-24 px-6 bg-base-100">
			<div className="max-w-5xl mx-auto mb-16">
				<h2 className="font-display text-5xl md:text-6xl text-secondary">
					WHAT THE PARTY OFFERS
				</h2>
				<p className="max-w-xl mt-4 text-base-content">
					A working Static Site Generator in ~1500 lines of well-commented code.
					Learn island architecture by reading the source.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				<FeatureCard
					title="ISLAND ARCHITECTURE"
					description="Static HTML by default. JavaScript only where you need it."
					href="/how-it-works"
					color="primary"
				/>
				<FeatureCard
					title="~1500 LINES OF CODE"
					description="The entire engine fits in your head. Every file explains why."
					href="https://github.com/ViktorZhurbin/castro/tree/main/castro/src"
					external
					color="secondary"
				/>
				<FeatureCard
					title="THREE HYDRATION STRATEGIES"
					description="Immediate, lazy, or static-only. You choose per component."
					href="/showcase"
					color="accent"
				/>
				<FeatureCard
					title="MULTI-FRAMEWORK"
					description="Preact and Solid on the same page. Extensible via plugins."
					href="/guide/multi-framework"
					color="secondary"
				/>
				<FeatureCard
					title="BUN-NATIVE"
					description="Built on Bun from the ground up. No webpack, no vite, no config files."
					href="/guide/quick-start"
					color="accent"
				/>
				<FeatureCard
					title="PLUGIN SYSTEM"
					description="Tailwind CSS, custom frameworks, asset injection."
					href="/guide/plugins"
					color="primary"
				/>
			</div>
		</section>
	);
}

function HowItWorks() {
	return (
		<section className="py-24 px-6 bg-base-200">
			<div className="text-center mb-16">
				<h2 className="font-display text-5xl md:text-6xl text-accent">
					HOW THE REVOLUTION WORKS
				</h2>
				<p className="max-w-xl mx-auto mt-4 text-base-content/80">
					Island architecture explained. No magic, just smart progressive
					enhancement.
				</p>
			</div>

			<ul className="steps steps-vertical max-w-3xl mx-auto">
				<li className="step step-primary" data-content="1">
					<div className="text-left py-4">
						<h3 className="font-display text-2xl text-secondary">BUILD TIME</h3>
						<p className="text-base-content/80 mt-1">
							Castro compiles your pages and renders all islands to static HTML.
							Every component gets server-side rendered at build time, creating
							instant visual content.
						</p>
					</div>
				</li>
				<li className="step step-primary" data-content="2">
					<div className="text-left py-4">
						<h3 className="font-display text-2xl text-secondary">
							BROWSER RECEIVES HTML
						</h3>
						<p className="text-base-content/80 mt-1">
							Pure HTML arrives first. Your page is visible immediately. No
							waiting for JavaScript bundles. Islands are wrapped in{" "}
							<code>{"<castro-island>"}</code> custom elements.
						</p>
					</div>
				</li>
				<li className="step step-primary" data-content="3">
					<div className="text-left py-4">
						<h3 className="font-display text-2xl text-secondary">
							SELECTIVE HYDRATION
						</h3>
						<p className="text-base-content/80 mt-1">
							JavaScript loads based on your directive. <code>no:pasaran</code>{" "}
							stays static. <code>lenin:awake</code> hydrates immediately.{" "}
							<code>comrade:visible</code> waits for viewport intersection.
						</p>
					</div>
				</li>
				<li className="step step-primary" data-content="4">
					<div className="text-left py-4">
						<h3 className="font-display text-2xl text-secondary">
							INTERACTIVE ISLANDS
						</h3>
						<p className="text-base-content/80 mt-1">
							Components become interactive exactly when needed. Fast initial
							load, progressive enhancement, minimal JavaScript. This is island
							architecture.
						</p>
					</div>
				</li>
			</ul>
		</section>
	);
}
