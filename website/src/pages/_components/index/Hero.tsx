import "./Hero.css";
import { StarIcon } from "@/components/icons/StarIcon";
import { CTAButtons } from "./CTAButtons";

export function Hero() {
	return (
		<div class="hero">
			<div class="container hero-content">
				<div>
					<StarIcon />
				</div>
				<h1>CASTRO</h1>

				<hr class="hero-hr" />

				<h2>A Static Site Generator Built to Be Read</h2>
				<p class="hero-subtitle">
					Preact islands, JSX, and Bun. Small enough to read in an afternoon,
					serious enough to build this website.
				</p>
				<p class="hero-quote">The satire is optional. The code is serious.</p>
				<CTAButtons />
			</div>
		</div>
	);
}
