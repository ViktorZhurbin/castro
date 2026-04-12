import "./CTAButtons.css";

export function CTAButtons() {
	return (
		<div class="cta-buttons-container">
			<a href="/guide/quick-start" class="btn btn-primary">
				GET STARTED
			</a>
			<a href="/how-it-works" class="btn btn-neutral">
				HOW IT WORKS
			</a>
			<a
				href="https://github.com/ViktorZhurbin/castro"
				target="_blank"
				rel="noopener"
				class="btn btn-base"
			>
				VIEW SOURCE
			</a>
		</div>
	);
}
