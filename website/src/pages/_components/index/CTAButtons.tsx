import "./CTAButtons.css";

export function CTAButtons(props: { className?: string }) {
	return (
		<div class={`cta-buttons-container ${props.className}`}>
			<a
				href="https://github.com/ViktorZhurbin/castro"
				target="_blank"
				rel="noopener"
				class="btn btn-primary"
			>
				READ THE SOURCE
			</a>
		</div>
	);
}
