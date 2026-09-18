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

        {/* <h2>A Five-Year Plan to Understand One's Own Framework</h2> */}
        <h2>My Five-Year Plan to Build a Framework Over a Weekend</h2>
        {/* <h2>A weekend project, three months in</h2> */}
        {/* <h2>Built with an LLM. Argued with it for three months</h2> */}
        <p class="hero-subtitle">Bun, Preact. ~1350 lines.</p>
        <p class="hero-subtitle">Delivered in three months, ahead of schedule.</p>
        <p class="hero-quote">The satire is optional. The code compiles.</p>
        <CTAButtons />
      </div>
    </div>
  );
}
