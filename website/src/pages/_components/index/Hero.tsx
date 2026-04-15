import "./Hero.css";
import { StarIcon } from "@components/icons/StarIcon";
import { CTAButtons } from "./CTAButtons";

export function Hero() {
	return (
		<div class="hero">
			<div class="container hero-content">
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
	);
}
