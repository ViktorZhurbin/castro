import { StarIcon } from "@components/icons/StarIcon.tsx";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<section class="max-w-5xl mx-auto py-24 px-6 bg-base-100">
				<div class="text-center mb-16">
					<h2 class="font-display text-primary mb-4">WHAT THE PARTY OFFERS</h2>
					<p>
						A working static site generator you can read in an afternoon and
						understand completely.
					</p>
				</div>

				<InteractivitySpectrum />
				<AlsoIncluded />
			</section>

			<section class="py-24 px-6 bg-base-200 flex flex-col gap-16">
				<HowItWorks />
				<CTAButtons />
			</section>
		</>
	);
}

function Hero() {
	return (
		<div class="hero sm:min-h-[calc(100vh-3rem)] bg-base-200">
			<div class="hero-content text-center px-6">
				<div class="max-w-3xl flex flex-col items-center">
					<div class="w-32 h-32 mb-8 text-primary">
						<StarIcon />
					</div>
					<h1 class="font-display mb-3">CASTRO</h1>
					<p class="font-display text-3xl md:text-5xl">
						THE PEOPLE'S FRAMEWORK
					</p>

					<hr class="border-0 border-t-8 border-primary w-32 mx-auto my-10" />

					<p class="text-lg font-bold mb-1">
						Your Five-Year Plan to Learn Island Architecture
					</p>
					<p class="italic text-sm mb-10 text-base-content">
						"The satire is optional. The knowledge is real."
					</p>
					<CTAButtons />
				</div>
			</div>
		</div>
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

function InteractivitySpectrum() {
	return (
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
					borderColor="border-t-primary"
				/>
				<SpectrumCard
					level="02"
					title="CLIENT SCRIPT"
					js="one function"
					body="DOM access without a framework runtime."
					borderColor="border-t-secondary"
				/>
				<SpectrumCard
					level="03"
					title="VANILLA ISLAND"
					js="your code only"
					body="Full island lifecycle, no framework cost."
					borderColor="border-t-accent"
				/>
				<SpectrumCard
					level="04"
					title="FRAMEWORK ISLAND"
					js="your code + runtime"
					body="Reactive state when you need it."
					borderColor="border-t-primary"
				/>
			</div>
		</div>
	);
}

interface SpectrumCardProps {
	level: string;
	title: string;
	js: string;
	body: string;
	borderColor: string;
}

function SpectrumCard({
	level,
	title,
	js,
	body,
	borderColor,
}: SpectrumCardProps) {
	return (
		<div
			class={`flex flex-col gap-3 p-5 bg-base-200 border-2 border-neutral border-t-8 ${borderColor}`}
		>
			<span class="font-display text-base-content text-2xl">{level}</span>
			<p class="text-2xl font-display">{title}</p>
			<span class="font-mono text-xs font-bold uppercase tracking-wider border px-2 py-1">
				js: {js}
			</span>
			<p>{body}</p>
		</div>
	);
}

function AlsoIncluded() {
	return (
		<>
			<div class="c-divider-section">
				ALSO INCLUDED
			</div>
			<div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
				<AlsoIncludedItem
					title="BUN-NATIVE"
					description="No Webpack, no Vite. Built on Bun's build pipeline from the ground up."
					borderColor="border-l-secondary"
				/>
				<AlsoIncludedItem
					title="PLUGIN SYSTEM"
					description="Tailwind, custom frameworks, asset injection. The core stays small."
					borderColor="border-l-accent"
				/>
				<AlsoIncludedItem
					title="READABLE BY DESIGN"
					description="Every file explains why. Read the source, understand the system."
					borderColor="border-l-primary"
				/>
			</div>
		</>
	);
}

interface AlsoIncludedItemProps {
	title: string;
	description: string;
	borderColor: string;
}

function AlsoIncludedItem({
	title,
	description,
	borderColor,
}: AlsoIncludedItemProps) {
	return (
		<div
			class={`bg-base-100 border-2 border-l-6 border-neutral ${borderColor} p-6`}
		>
			<p class="font-display text-2xl mb-2">{title}</p>
			<p>{description}</p>
		</div>
	);
}

function HowItWorks() {
	return (
		<div class="max-w-3xl mx-auto flex flex-col items-center">
			<div class="text-center mb-16">
				<h2 class="font-display text-primary">HOW IT WORKS AT RUNTIME</h2>
				<p class="max-w-xl mt-4 text-lg">
					Island architecture in four steps. No magic, just HTML-first
					progressive enhancement.
				</p>
			</div>

			<div class="flex flex-col gap-6">
				<div class="c-step">
					<div class="c-step-number">1</div>
					<div class="c-step-content">
						<h3 class="c-step-title">BROWSER RECEIVES HTML</h3>
						<p>
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
						<p>
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
						<p>
							Each island hydrates independently. A heavy island below the fold
							never delays a critical one above it. Static content stays static.
						</p>
					</div>
				</div>

				<div class="c-step">
					<div class="c-step-number">4</div>
					<div class="c-step-content">
						<h3 class="c-step-title">YOU SHIPPED LESS JAVASCRIPT</h3>
						<p>
							Only the code your islands need reaches the browser. No framework
							runtime on static pages. No bundling what isn't used. That's the
							point.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
