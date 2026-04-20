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

				<h2>Your Five-Year Plan to Learn Island Architecture</h2>
				<p class="hero-quote">The satire is optional. The knowledge is real.</p>
				<CTAButtons />
			</div>
		</div>
	);
}
