import { Section } from "./Section";

export function SelfCriticism() {
  return (
    <Section title="Self-Criticism">
      <p>
        Castro began as a transcription error. Dictation software heard "Astro" and produced
        "Castro," and the rest of the project followed from the joke.
      </p>
      <p>
        Anyone can build a framework now. That is roughly the point, and it isn't the whole story. A
        language model will write you a static site generator this afternoon. It will also write you
        three more abstractions than you need, and it will keep doing that indefinitely. Most of the
        work was removing things. The ~1,350 lines are what survived.
      </p>
      <p>
        The existing tools are good. Astro carries more than I wanted to carry. Eleventy asked me to
        assemble more than I wanted to assemble. I wanted JSX and Markdown in, static HTML out,
        islands only where I ask for them. That is a small want, and this is a small thing that
        satisfies it.
      </p>
    </Section>
  );
}
