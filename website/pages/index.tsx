import { FeatureCard } from "@components/FeatureCard.tsx";
import { StarIcon } from "@components/icons/StarIcon.tsx";
import type { PageMeta } from "@vktrz/castro";

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
		<div class="hero min-h-[calc(100vh-3rem)] bg-base-200">
			<div class="hero-content text-center">
				<div class="max-w-3xl">
					<div class="w-32 h-32 mx-auto mb-10 text-primary">
						<StarIcon />
					</div>
					<h1 class="font-display text-8xl md:text-9xl text-primary">CASTRO</h1>
					<p class="font-display text-3xl md:text-5xl mt-2 mb-6">
						THE PEOPLE'S FRAMEWORK
					</p>
					<div class="divider divider-primary max-w-xs mx-auto" />
					<p class="text-lg font-bold mb-1">
						Your Five-Year Plan to Learn Island Architecture
					</p>
					<p class="italic text-sm mb-10 text-base-content/80">
						"The satire is optional. The knowledge is real."
					</p>
					<div class="flex flex-wrap gap-4 justify-center">
						<a href="/guide/quick-start" class="btn btn-lg btn-primary">
							GET STARTED
						</a>
						<a href="/how-it-works" class="btn btn-lg btn-secondary">
							HOW IT WORKS
						</a>
						<a
							href="https://github.com/ViktorZhurbin/castro"
							target="_blank"
							rel="noopener"
							class="btn btn-lg btn-outline"
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
		<section class="py-24 px-6 bg-base-100">
			<div class="max-w-5xl mx-auto mb-16">
				<h2 class="font-display text-5xl md:text-6xl text-secondary">
					WHAT THE PARTY OFFERS
				</h2>
				<p class="mt-4">
					A working Static Site Generator in ~1500 lines of well-commented code.
					Learn island architecture by reading the source.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
					title="CLIENT DIRECTIVES"
					description="Immediate, idle, or lazy. You choose per component."
					href="/guide/components-islands"
					color="accent"
				/>
				<FeatureCard
					title="BUN-NATIVE"
					description="Built on Bun from the ground up. No webpack, no vite, no config files."
					href="/guide/quick-start"
					color="primary"
				/>
				<FeatureCard
					title="PLUGIN SYSTEM"
					description="Tailwind CSS, custom frameworks, asset injection."
					href="/guide/plugins"
					color="secondary"
				/>
			</div>
		</section>
	);
}

function HowItWorks() {
	return (
		<section class="flex flex-col py-24 px-6 bg-base-200">
			<div class="text-center mb-16">
				<h2 class="font-display text-5xl md:text-6xl text-accent">
					HOW THE REVOLUTION WORKS
				</h2>
				<p class="max-w-xl mx-auto mt-4">
					Island architecture explained. No magic, just smart progressive
					enhancement.
				</p>
			</div>

			<ul class="steps steps-vertical max-w-3xl mx-auto">
				<li class="step step-primary" data-content="1">
					<div class="text-left py-4">
						<h3 class="font-display text-2xl text-secondary">BUILD TIME</h3>
						<p class="mt-1">
							Castro compiles your pages and renders all islands to static HTML.
							Every component gets server-side rendered at build time, creating
							instant visual content.
						</p>
					</div>
				</li>
				<li class="step step-primary" data-content="2">
					<div class="text-left py-4">
						<h3 class="font-display text-2xl text-secondary">
							BROWSER RECEIVES HTML
						</h3>
						<p class="mt-1">
							Pure HTML arrives first. Your page is visible immediately. No
							waiting for JavaScript bundles. Islands are wrapped in{" "}
							<code>{"<castro-island>"}</code> custom elements.
						</p>
					</div>
				</li>
				<li class="step step-primary" data-content="3">
					<div class="text-left py-4">
						<h3 class="font-display text-2xl text-secondary">
							SELECTIVE HYDRATION
						</h3>
						<p class="mt-1">
							JavaScript loads based on your directive.{" "}
							<code>comrade:eager</code> hydrates immediately.{" "}
							<code>comrade:patient</code> waits for idle time.{" "}
							<code>comrade:visible</code> waits for viewport intersection.
						</p>
					</div>
				</li>
				<li class="step step-primary" data-content="4">
					<div class="text-left py-4">
						<h3 class="font-display text-2xl text-secondary">
							INTERACTIVE ISLANDS
						</h3>
						<p class="mt-1">
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
