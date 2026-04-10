import { StarIcon } from "@components/icons/StarIcon.tsx";
import "./_index.css";

export const meta = { title: "Castro - The People's Framework" };

export default function Home() {
	return (
		<>
			<Hero />

			<section class="feature-section">
				<div class="feature-section-header">
					<h2>WHAT THE PARTY OFFERS</h2>
					<p>
						A working static site generator you can read in an afternoon and
						understand completely.
					</p>
				</div>

				<InteractivitySpectrum />
				<AlsoIncluded />
			</section>

			<section class="cta-buttons">
				<HowItWorks />
				<CTAButtons />
			</section>
		</>
	);
}

function Hero() {
	return (
		<div class="hero">
			<div class="hero-content">
				<div>
					<div>
						<StarIcon />
					</div>
					<h1>CASTRO</h1>
					<p class="subtitle">THE PEOPLE'S FRAMEWORK</p>

					<hr class="hero-hr" />

					<p class="hero-tagline">
						Your Five-Year Plan to Learn Island Architecture
					</p>
					<p class="hero-quote">
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
		<div class="cta-buttons-container">
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
		<div class="spectrum-grid">
			<h3>THE INTERACTIVITY SPECTRUM</h3>
			<p>
				Each level adds capability and ships more JavaScript. The right choice
				is the lowest level that meets your needs.
			</p>
			<div class="spectrum-cards">
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
			class="spectrum-card"
			style={`border-top-color: ${getBorderColor(borderColor)}`}
		>
			<span class="spectrum-card-level">{level}</span>
			<p class="spectrum-card-title">{title}</p>
			<span class="spectrum-card-js">js: {js}</span>
			<p>{body}</p>
		</div>
	);
}

function getBorderColor(borderColor: string): string {
	const colors: Record<string, string> = {
		"border-t-primary": "var(--pico-primary)",
		"border-t-secondary": "var(--pico-secondary)",
		"border-t-accent": "var(--pico-secondary)",
	};
	return colors[borderColor] || "var(--pico-primary)";
}

function AlsoIncluded() {
	return (
		<>
			<div class="c-divider-section">ALSO INCLUDED</div>
			<div class="also-included-grid">
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
			class="also-included-item"
			style={`border-left-color: ${getBorderColor(borderColor)}`}
		>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

function HowItWorks() {
	return (
		<div class="how-it-works">
			<div class="how-it-works-header">
				<h2>HOW IT WORKS AT RUNTIME</h2>
				<p class="how-it-works-intro">
					Island architecture in four steps. No magic, just HTML-first
					progressive enhancement.
				</p>
			</div>

			<div class="how-it-works-steps">
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
