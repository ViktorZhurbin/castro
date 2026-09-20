import "./Hero.css";
import { CTAButtons } from "./CTAButtons";

export function Hero() {
  return (
    <section class="hero">
      <h1 class="hero-masthead">CASTRO</h1>

      <div class="hero-bar" />

      <div class="hero-columns">
        <div class="hero-lead">
          {/* <h2>A Five-Year Plan to Understand One's Own Framework</h2> */}
          <h2>My Five-Year Plan to Build a Framework Over a Weekend</h2>
          {/* <h2>A weekend project, three months in</h2> */}
          {/* <h2>Built with an LLM. Argued with it for three months</h2> */}
        </div>

        <div class="hero-aside">
          <p>A static site generator on Bun and Preact. ~1,350 lines.</p>
          <p>Delivered in three months, ahead of schedule.</p>
          <CTAButtons />
        </div>
      </div>
    </section>
  );
}
