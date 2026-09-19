import { Section } from "./Section";

import "./Why.css";

export function Why() {
  return (
    <Section title="The Why">
      <div class="why-columns">
        <p>
          Astro carried more than I needed. Eleventy left more for me to assemble. Neither was small
          enough to read end to end.
        </p>
        <p>
          So I built one, with an LLM. Anyone can do that now; a framework for your own blog is a
          weekend project. Mine took three months.
        </p>
      </div>
    </Section>
  );
}
