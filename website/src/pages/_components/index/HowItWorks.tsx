import "./HowItWorks.css";

export function HowItWorks() {
	return (
		<div class="container how-it-works">
			<div class="how-it-works-header">
				<h2>HOW IT WORKS AT RUNTIME</h2>
				<p class="how-it-works-intro">
					Island architecture in four steps. No magic, just HTML-first
					progressive enhancement.
				</p>
			</div>

			<div class="how-it-works-steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3 class="step-title">BROWSER RECEIVES HTML</h3>
						<p>
							Castro renders everything to HTML at build time. Pure HTML arrives
							first — your page is visible immediately, no JavaScript required.
							Islands are wrapped in <code>{"<castro-island>"}</code> custom
							elements.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3 class="step-title">SELECTIVE HYDRATION</h3>
						<p>
							JavaScript loads only for islands that need it, based on your
							directive. <code>comrade:eager</code> hydrates immediately.{" "}
							<code>comrade:patient</code> waits for idle time.{" "}
							<code>comrade:visible</code> waits until the island enters the
							viewport.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3 class="step-title">ISLANDS ACTIVATE</h3>
						<p>
							Each island hydrates independently. A heavy island below the fold
							never delays a critical one above it. Static content stays static.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">4</div>
					<div class="step-content">
						<h3 class="step-title">YOU SHIPPED LESS JAVASCRIPT</h3>
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
