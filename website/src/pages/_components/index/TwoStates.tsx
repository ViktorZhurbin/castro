import "./TwoStates.css";

export function TwoStates() {
	return (
		<div class="container">
			<div class="spectrum-section-header">
				<h2>TWO STATES, ONE PATTERN</h2>
				<p>
					Most of your page is static HTML. The interactive parts are islands.
					That's the whole idea.
				</p>
			</div>

			<div class="two-state-grid">
				<article class="two-state-card">
					<p class="two-state-label">SHIPS BY DEFAULT</p>
					<h3>STATIC HTML</h3>
					<p>
						Rendered once, at build time. Zero JavaScript. Visible the moment it
						arrives.
					</p>
				</article>

				<article class="two-state-card">
					<p class="two-state-label">SHIPS WHEN NEEDED</p>
					<h3>HYDRATED ISLAND</h3>
					<p>
						An interactive component, isolated. JavaScript loads only for this
						island, only when its hydration condition is met.
					</p>
				</article>
			</div>

			<p class="two-state-footnote">
				The page is mostly the first kind. Islands are the exception, not the
				rule. <a href="/concept/island-architecture">Read why this matters →</a>
			</p>
		</div>
	);
}
