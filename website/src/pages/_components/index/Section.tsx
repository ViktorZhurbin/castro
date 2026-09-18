import type { ComponentChildren } from "preact";

import "./Section.css";

/**
 * One landing-page section: the shared measure, vertical rhythm, and title.
 * Every section on the page goes through here so the left edge stays put as
 * the reader scrolls — sections used to carry their own container width, and
 * the text stepped in and out four times down the page.
 *
 * Alternating background comes from `Section.css`'s `nth-of-type(even)` rule,
 * not a prop — position on the page decides it, so it can't drift out of sync
 * one component at a time.
 */
export function Section(props: { title: string; children: ComponentChildren }) {
  return (
    <section class="section">
      <div class="section-body">
        <h2 class="section-title">{props.title}</h2>
        {props.children}
      </div>
    </section>
  );
}
