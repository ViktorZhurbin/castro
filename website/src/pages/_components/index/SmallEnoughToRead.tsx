import { Section } from "./Section";

export function SmallEnoughToRead() {
  return (
    <Section title="A Framework Small Enough to Read">
      <p>
        The commented source covers the dev server, file-based routing, structured errors, the build
        pipeline, and the hydration runtime. Each module is meant to fit in your head.
      </p>
      <p>
        You can trace a page from file to route to HTML. You can see exactly where an island's
        JavaScript gets requested. When something is wrong, you can find it.
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
