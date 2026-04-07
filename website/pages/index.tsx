import { FeatureCard } from "@components/FeatureCard.tsx";
import { StarIcon } from "@components/icons/StarIcon.tsx";

export const meta = { title: "Castro - The People's Framework" };

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

					<hr class="border-0 border-t-8 border-primary w-32 mx-auto my-10" />

					<p class="text-lg font-bold mb-1">
						Your Five-Year Plan to Learn Island Architecture
					</p>
					<p class="italic text-sm mb-10 text-base-content/80">
						"The satire is optional. The knowledge is real."
					</p>
					<div class="flex flex-wrap gap-4 justify-center">
						<a href="/guide/quick-start" class="c-btn c-btn-primary">
							GET STARTED
						</a>
						<a href="/how-it-works" class="c-btn c-btn-neutral">
							HOW IT WORKS
						</a>
						<a
							href="https://github.com/ViktorZhurbin/castro"
							target="_blank"
							rel="noopener"
							class="c-btn c-btn-base"
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
			<div class="max-w-5xl mx-auto text-center mb-16">
				<h2 class="font-display text-5xl md:text-6xl text-base-content">
					WHAT THE PARTY OFFERS
				</h2>
				<p class="mt-4">
					Everything you need. Nothing you don't. Each piece is small enough to
					read, understand, and replace.
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
					title="READABLE BY DESIGN"
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
				<FeatureCard
					title="INTERACTIVITY SPECTRUM"
					description="Static component, ClientScript, vanilla island, framework island. Choose your level."
					href="/guide/components-islands"
					color="accent"
				/>
			</div>
		</section>
	);
}

function HowItWorks() {
	return (
		<section class="flex flex-col py-24 px-6 bg-base-200">
			<div class="text-center mb-16">
				<h2 class="font-display text-5xl md:text-6xl text-primary">
					HOW THE REVOLUTION WORKS
				</h2>
				<p class="max-w-xl mx-auto mt-4 text-base-content/80 text-lg">
					Island architecture explained. No magic, just smart progressive
					enhancement.
				</p>
			</div>

			<div class="max-w-3xl mx-auto flex flex-col gap-6">
				<div class="step-block">
					<div class="step-block-number">1</div>
					<div class="step-block-content">
						<h3 class="step-block-title">BUILD TIME</h3>
						<p class="text-base-content/80">
							Castro compiles your pages and renders all islands to HTML before
							anything reaches the browser.
						</p>
					</div>
				</div>

				<div class="step-block">
					<div class="step-block-number">2</div>
					<div class="step-block-content">
						<h3 class="step-block-title">BROWSER RECEIVES HTML</h3>
						<p class="text-base-content/80">
							Pure HTML arrives first. Your page is visible immediately. No
							waiting for JavaScript bundles. Islands are wrapped in{" "}
							<code>{"<castro-island>"}</code> custom
							elements.
						</p>
					</div>
				</div>

				<div class="step-block">
					<div class="step-block-number">3</div>
					<div class="step-block-content">
						<h3 class="step-block-title">SELECTIVE HYDRATION</h3>
						<p class="text-base-content/80">
							JavaScript loads based on your directive.{" "}
							<code>comrade:eager</code> hydrates
							immediately. <code>comrade:patient</code>{" "}
							waits for idle time.{" "}
							<code>comrade:visible</code> waits for
							viewport intersection.
						</p>
					</div>
				</div>

				<div class="step-block">
					<div class="step-block-number">4</div>
					<div class="step-block-content">
						<h3 class="step-block-title">INTERACTIVE ISLANDS</h3>
						<p class="text-base-content/80">
							Components become interactive exactly when needed. That's island
							architecture — the rest of the page never waits for them.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
