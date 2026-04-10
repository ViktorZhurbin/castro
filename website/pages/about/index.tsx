import "./index.css";

export const meta = { title: "About - Castro" };

export default function About() {
	return (
		<section class="about-section">
			<div class="about-content">
				<h1>ABOUT</h1>
				<div class="about-divider" />
				<h2>WHY IT EXISTS</h2>

				<p>
					Castro started as a learning project that became a working framework.
					Existing static site generators were either too implicit or too heavy
					- the gap between "I want a fast static site" and "I want to
					understand how island architecture actually works" had no good answer.
				</p>

				<p>
					Every design decision traces back to a specific frustration. JSX and
					TypeScript everywhere, because implicit template magic obscures what's
					happening. Small enough to read in an afternoon, because a codebase
					you can understand beats one you can only trust.
				</p>

				<p>The communist theme makes it memorable. The lessons are real.</p>

				<div class="about-cta">
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
						class="c-btn c-btn-primary"
					>
						VIEW SOURCE
					</a>
					<a href="/how-it-works" class="c-btn c-btn-neutral">
						HOW IT WORKS
					</a>
				</div>
			</div>
		</section>
	);
}
