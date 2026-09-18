import { Section } from "./Section";

export function SmallEnoughToRead() {
  return (
    <Section title="A Framework Small Enough to Read">
      <p>
        Dev server, file-based routing, structured errors, build pipeline, hydration runtime —
        ~1,350 lines in all. Each module is commented and meant to fit in your head.
      </p>
      <p>
        You can trace a page from file to route to HTML. You can see exactly where an island's
        JavaScript gets requested.
      </p>
      <a
        href="https://github.com/ViktorZhurbin/castro"
        target="_blank"
        rel="noopener"
        role="button"
      >
        READ THE SOURCE
      </a>
    </Section>
  );
}
