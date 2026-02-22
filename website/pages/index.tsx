import type { PageMeta } from "@vktrz/castro";
import { DirectiveCard } from "../components/DirectiveCard.tsx";
import { StarIcon } from "../components/icons/StarIcon.tsx";
import MyCounter from "../components/MyCounter.island.tsx";

export const meta: PageMeta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			{/* Hero — full-bleed dark with constructivist rays */}
			<div className="hero min-h-[calc(100vh-3rem)] bg-neutral text-neutral-content castro-rays">
				<div className="hero-content text-center">
					<div className="max-w-3xl">
						<div className="w-32 h-32 mx-auto mb-10 text-primary drop-shadow-lg">
							<StarIcon />
						</div>
						<h1 className="font-display text-8xl md:text-9xl tracking-wider text-primary drop-shadow-md">
							CASTRO
						</h1>
						<p className="font-display text-3xl md:text-5xl tracking-wide mt-2 mb-6">
							THE PEOPLE'S FRAMEWORK
						</p>
						<div className="divider divider-primary max-w-xs mx-auto" />
						<p className="text-lg font-bold mb-1 text-neutral-content">
							The Educational Island Architecture Framework
						</p>
						<p className="text-lg font-bold mb-6 text-neutral-content/70">
							(That Happens to Be Communist)
						</p>
						<p className="italic text-sm mb-10 text-neutral-content/60">
							"The satire is optional. The knowledge is real."
						</p>
						<div className="flex flex-wrap gap-4 justify-center">
							<a
								href="/manifesto"
								className="btn btn-primary btn-lg font-display text-xl tracking-wider"
							>
								READ THE MANIFESTO
							</a>
							<a
								href="https://github.com/vktrz/castro"
								target="_blank"
								rel="noopener"
								className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content btn-lg font-display text-xl tracking-wider"
							>
								VIEW SOURCE
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Directives — cream background, three strong cards */}
			<section className="py-24 px-6 bg-base-100">
				<div className="text-center mb-16">
					<h2 className="font-display text-5xl md:text-6xl tracking-wide text-secondary">
						THE REVOLUTIONARY DIRECTIVES
					</h2>
					<div className="divider divider-secondary max-w-xs mx-auto" />
					<p className="max-w-xl mx-auto text-base-content/70">
						Learn how modern SSGs work by reading ~1500 lines of well-commented
						code. Three hydration strategies. Zero configuration.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<DirectiveCard
						name="NO:PASARAN"
						slogan='"They shall not pass (to the client)"'
						description="Component renders at build time. No JavaScript shipped to client. Pure static HTML for maximum performance."
						note="Try clicking. Nothing happens. Zero JS was sent to your browser."
						color="neutral"
					>
						<MyCounter initial={5} no:pasaran />
					</DirectiveCard>

					<DirectiveCard
						name="LENIN:AWAKE"
						slogan='"The leader is always ready"'
						description="Component becomes interactive immediately on page load. Full interactivity from the start."
						note="This counter is interactive immediately. JS loaded on page load."
						color="secondary"
					>
						<MyCounter initial={10} lenin:awake />
					</DirectiveCard>

					<DirectiveCard
						name="COMRADE:VISIBLE"
						slogan='"Only work when the people are watching"'
						description="Component hydrates when scrolled into viewport. Lazy loading with IntersectionObserver. Default behavior."
						note="JS loads when scrolled into view. Open DevTools Network tab to verify."
						color="primary"
					>
						<MyCounter initial={15} comrade:visible />
					</DirectiveCard>
				</div>
			</section>

			{/* How It Works — dark section with steps */}
			<section className="py-24 px-6 bg-neutral text-neutral-content castro-rays">
				<div className="text-center mb-16">
					<h2 className="font-display text-5xl md:text-6xl tracking-wide text-primary">
						HOW THE REVOLUTION WORKS
					</h2>
					<div className="divider divider-primary max-w-xs mx-auto" />
					<p className="max-w-xl mx-auto text-neutral-content/70">
						Island architecture explained. No magic, just smart progressive
						enhancement.
					</p>
				</div>

				<ul className="steps steps-vertical max-w-3xl mx-auto">
					<li className="step step-primary" data-content="1">
						<div className="text-left py-4">
							<h3 className="font-display text-2xl tracking-wide text-primary">
								BUILD TIME
							</h3>
							<p className="text-neutral-content/70 mt-1">
								Castro compiles your pages and renders all islands to static
								HTML. Every component gets server-side rendered, creating
								instant visual content.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="2">
						<div className="text-left py-4">
							<h3 className="font-display text-2xl tracking-wide text-primary">
								BROWSER RECEIVES HTML
							</h3>
							<p className="text-neutral-content/70 mt-1">
								Pure HTML arrives first. Your page is visible immediately. No
								waiting for JavaScript bundles. Islands are wrapped in{" "}
								<code className="bg-neutral-content/10 px-1">
									{"<castro-island>"}
								</code>{" "}
								custom elements.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="3">
						<div className="text-left py-4">
							<h3 className="font-display text-2xl tracking-wide text-primary">
								SELECTIVE HYDRATION
							</h3>
							<p className="text-neutral-content/70 mt-1">
								JavaScript loads based on your directive.{" "}
								<code className="bg-neutral-content/10 px-1">no:pasaran</code>{" "}
								stays static.{" "}
								<code className="bg-neutral-content/10 px-1">lenin:awake</code>{" "}
								hydrates immediately.{" "}
								<code className="bg-neutral-content/10 px-1">
									comrade:visible
								</code>{" "}
								waits for viewport intersection.
							</p>
						</div>
					</li>
					<li className="step step-primary" data-content="4">
						<div className="text-left py-4">
							<h3 className="font-display text-2xl tracking-wide text-primary">
								INTERACTIVE ISLANDS
							</h3>
							<p className="text-neutral-content/70 mt-1">
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
