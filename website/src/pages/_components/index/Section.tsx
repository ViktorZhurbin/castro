import type { ComponentChildren } from "preact";

import "./Section.css";

/**
 * One landing-page section: the numbered title rule, the gutter, and the
 * vertical rhythm. Every section goes through here so the left edge stays
 * put as the reader scrolls — sections used to carry their own container
 * width, and the text stepped in and out four times down the page.
 *
 * The number (01, 02, …) comes from a CSS counter in `Section.css`, not a
 * prop — position on the page decides it, so reordering sections in
 * `index.tsx` can't leave the numbers out of sequence.
 */
export function Section(props: { title: string; children: ComponentChildren }) {
  return (
    <section class="section">
      <h2 class="section-title">{props.title}</h2>
      {props.children}
    </section>
  );
}
