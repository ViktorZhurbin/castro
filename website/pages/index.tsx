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

function CTAButtons() {
	return (
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
	);
}

function Hero() {
	return (
		<div class="hero sm:min-h-[calc(100vh-3rem)] bg-base-200">
			<div class="hero-content text-center px-6">
				<div class="max-w-3xl">
					<div class="w-32 h-32 mx-auto mb-10 text-primary">
						<StarIcon />
					</div>
					<h1 class="font-display">CASTRO</h1>
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
					<CTAButtons />
				</div>
			</div>
		</div>
	);
}

function Features() {
	return (
		<section class="py-24 px-6 bg-base-100">
			<div class="max-w-5xl mx-auto text-center mb-16">
				<h2 class="font-display text-primary">WHAT THE PARTY OFFERS</h2>
				<p class="mt-4">
					A working static site generator you can read in an afternoon and
					understand completely.
				</p>
			</div>

			<div class="max-w-4xl mx-auto text-center">
				<h3 class="font-display mb-6">THE INTERACTIVITY SPECTRUM</h3>
				<p class="text-center mb-4">
					Each level adds capability and ships more JavaScript. The right choice
					is the lowest level that meets your needs.
				</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
					<SpectrumCard
						level="01"
						title="STATIC"
						js="0 bytes"
						body="JSX rendered to HTML at build time."
						color="primary"
					/>
					<SpectrumCard
						level="02"
						title="CLIENT SCRIPT"
						js="one function"
						body="DOM access without a framework runtime."
						color="secondary"
					/>
					<SpectrumCard
						level="03"
						title="VANILLA ISLAND"
						js="your code only"
						body="Full island lifecycle, no framework cost."
						color="accent"
					/>
					<SpectrumCard
						level="04"
						title="FRAMEWORK ISLAND"
						js="your code + runtime"
						body="Reactive state when you need it."
						color="primary"
					/>
				</div>
			</div>

			<div class="divider max-w-5xl mx-auto my-14 font-display text-lg text-base-content/80 tracking-widest">
				ALSO INCLUDED
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				<FeatureCard
					title="BUN-NATIVE"
					description="No Webpack, no Vite. Built on Bun's build pipeline from the ground up."
					color="secondary"
				/>
				<FeatureCard
					title="PLUGIN SYSTEM"
					description="Tailwind, custom frameworks, asset injection. The core stays small."
					color="accent"
				/>
				<FeatureCard
					title="READABLE BY DESIGN"
					description="Every file explains why. Read the source, understand the system."
					color="primary"
				/>
			</div>
		</section>
	);
}

interface FeatureCardProps {
	title: string;
	description: string;
	color?: "primary" | "secondary" | "accent";
}

const leftBorderColor = {
	primary: "border-l-primary",
	secondary: "border-l-secondary",
	accent: "border-l-accent",
};

function FeatureCard({
	title,
	description,
	color = "primary",
}: FeatureCardProps) {
	return (
		<div
			class={`bg-base-100 border-2 border-l-6 ${leftBorderColor[color]} p-6`}
		>
			<p class="font-display text-2xl mb-2">{title}</p>
			<p>{description}</p>
		</div>
	);
}

interface SpectrumCardProps {
	level: string;
	title: string;
	js: string;
	body: string;
	color: "primary" | "secondary" | "accent";
}

const topBorderColor = {
	primary: "border-t-primary",
	secondary: "border-t-secondary",
	accent: "border-t-accent",
};

function SpectrumCard({ level, title, js, body, color }: SpectrumCardProps) {
	return (
		<div
			class={`bg-base-200 border-2 border-t-8 ${topBorderColor[color]} p-5 flex flex-col gap-3`}
		>
			<span class="font-display text-base-content/70 text-2xl">{level}</span>
			<p class="text-2xl font-display">{title}</p>
			<span
				class={`font-mono text-xs font-bold uppercase tracking-wider border px-2 py-1`}
			>
				js: {js}
			</span>
			<p>{body}</p>
		</div>
	);
}

function HowItWorks() {
	return (
		<section class="flex flex-col py-24 px-6 bg-base-200">
			<div class="text-center mb-16">
				<h2 class="font-display text-primary">HOW IT WORKS AT RUNTIME</h2>
				<p class="max-w-xl mx-auto mt-4 text-base-content/80 text-lg">
					Island architecture in four steps. No magic, just HTML-first
					progressive enhancement.
				</p>
			</div>

			<div class="max-w-3xl mx-auto flex flex-col gap-6">
				<div class="c-step">
					<div class="c-step-number">1</div>
					<div class="c-step-content">
						<h3 class="c-step-title">BROWSER RECEIVES HTML</h3>
						<p class="text-base-content/80">
							Castro renders everything to HTML at build time. Pure HTML arrives
							first — your page is visible immediately, no JavaScript required.
							Islands are wrapped in <code>{"<castro-island>"}</code> custom
							elements.
						</p>
					</div>
				</div>

				<div class="c-step">
					<div class="c-step-number">2</div>
					<div class="c-step-content">
						<h3 class="c-step-title">SELECTIVE HYDRATION</h3>
						<p class="text-base-content/80">
							JavaScript loads only for islands that need it, based on your
							directive. <code>comrade:eager</code> hydrates immediately.{" "}
							<code>comrade:patient</code> waits for idle time.{" "}
							<code>comrade:visible</code> waits until the island enters the
							viewport.
						</p>
					</div>
				</div>

				<div class="c-step">
					<div class="c-step-number">3</div>
					<div class="c-step-content">
						<h3 class="c-step-title">ISLANDS ACTIVATE</h3>
						<p class="text-base-content/80">
							Each island hydrates independently. The rest of the page never
							waits. Static content stays static.
						</p>
					</div>
				</div>

				<div class="c-step">
					<div class="c-step-number">4</div>
					<div class="c-step-content">
						<h3 class="c-step-title">YOU SHIPPED LESS JAVASCRIPT</h3>
						<p class="text-base-content/80">
							Only the code your islands need reaches the browser. No framework
							runtime on static pages. No bundling what isn't used. That's the
							point.
						</p>
					</div>
				</div>
			</div>

			<div class="pt-16">
				<CTAButtons />
			</div>
		</section>
	);
}
