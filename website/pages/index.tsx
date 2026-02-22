import type { PageMeta } from "@vktrz/castro";
import { DirectiveCard } from "../components/DirectiveCard.tsx";
import { StarIcon } from "../components/icons/StarIcon.tsx";
import MyCounter from "../components/MyCounter.island.tsx";

export const meta: PageMeta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			{/* Hero */}
			<div className="hero min-h-screen bg-neutral text-neutral-content">
				<div className="hero-content text-center">
					<div className="max-w-2xl">
						<div className="w-20 h-20 mx-auto mb-8 text-primary">
							<StarIcon />
						</div>
						<h1 className="text-7xl font-bold uppercase text-primary">
							Castro
						</h1>
						<h2 className="text-4xl font-bold uppercase mb-4">
							The People's Framework
						</h2>
						<p className="text-lg font-bold mb-2">
							The Educational Island Architecture Framework
							<br />
							(That Happens to Be Communist)
						</p>
						<p className="italic mb-8 opacity-80">
							"The satire is optional. The knowledge is real."
						</p>
						<div className="flex flex-wrap gap-4 justify-center">
							<a href="/manifesto" className="btn btn-primary btn-lg uppercase">
								Read the Manifesto
							</a>
							<a
								href="https://github.com/vktrz/castro"
								target="_blank"
								rel="noopener"
								className="btn btn-outline btn-lg uppercase"
							>
								View Source Code
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Directives */}
			<section className="py-24 px-8 bg-base-200">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold uppercase mb-2 text-neutral">
						The Revolutionary Directives
					</h2>
					<div className="divider divider-primary max-w-xs mx-auto" />
					<p className="max-w-xl mx-auto text-base-content/70">
						Learn how modern SSGs work by reading ~1500 lines of well-commented
						code. Three hydration strategies. Zero configuration.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<DirectiveCard
						name="no:pasaran"
						slogan='"They shall not pass (to the client)"'
						description="Component renders at build time. No JavaScript shipped to client. Pure static HTML for maximum performance."
						note="Try clicking. Nothing happens. Zero JS was sent to your browser."
						color="neutral"
					>
						<MyCounter initial={5} no:pasaran />
					</DirectiveCard>

					<DirectiveCard
						name="lenin:awake"
						slogan='"The leader is always ready"'
						description="Component becomes interactive immediately on page load. Full interactivity from the start."
						note="This counter is interactive immediately. JS loaded on page load."
						color="primary"
					>
						<MyCounter initial={10} lenin:awake />
					</DirectiveCard>

					<DirectiveCard
						name="comrade:visible"
						slogan='"Only work when the people are watching"'
						description="Component hydrates when scrolled into viewport. Lazy loading with IntersectionObserver. Default behavior."
						note="JS loads when scrolled into view. Open DevTools Network tab to verify."
						color="accent"
					>
						<MyCounter initial={15} comrade:visible />
					</DirectiveCard>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-24 px-8 bg-neutral text-neutral-content">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold uppercase mb-2 text-primary">
						How The Revolution Works
					</h2>
					<div className="divider divider-primary max-w-xs mx-auto" />
					<p className="max-w-xl mx-auto opacity-80">
						Island architecture explained. No magic, just smart progressive
						enhancement.
					</p>
				</div>

				<ul className="steps steps-vertical max-w-3xl mx-auto">
					<li className="step step-primary" data-content="1">
						<div className="text-left">
							<h3 className="text-xl font-bold text-primary">Build Time</h3>
							<p className="opacity-80">
								Castro compiles your pages and renders all islands to static
								HTML. Every component gets server-side rendered, creating
								instant visual content.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="2">
						<div className="text-left">
							<h3 className="text-xl font-bold text-primary">
								Browser Receives HTML
							</h3>
							<p className="opacity-80">
								Pure HTML arrives first. Your page is visible immediately. No
								waiting for JavaScript bundles. Islands are wrapped in{" "}
								<code>{"<castro-island>"}</code> custom elements.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="3">
						<div className="text-left">
							<h3 className="text-xl font-bold text-primary">
								Selective Hydration
							</h3>
							<p className="opacity-80">
								JavaScript loads based on your directive.{" "}
								<code>no:pasaran</code> stays static. <code>lenin:awake</code>{" "}
								hydrates immediately. <code>comrade:visible</code> waits for
								viewport intersection.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="4">
						<div className="text-left">
							<h3 className="text-xl font-bold text-primary">
								Interactive Islands
							</h3>
							<p className="opacity-80">
								Components become interactive exactly when needed. Fast initial
								load, progressive enhancement, minimal JavaScript. This is
								island architecture.
							</p>
						</div>
					</li>
				</ul>
			</section>
		</>
	);
}
