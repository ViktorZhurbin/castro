import type { PageMeta, PageProps } from "@vktrz/castro";
import { useId, useState } from "preact/hooks";

export const meta = { title: "Page Props", subtitle: "From frontmatter" } satisfies PageMeta;

/**
 * Pins the page-as-component contract: pages render through h(), so frontmatter
 * arrives as props and hooks have a dispatcher. Both threw before that change.
 *
 * Also pins `PageProps`'s `T` parameter, and `{subtitle}` is all that takes:
 * without `typeof meta` the index signature hands it back as `unknown`, which
 * JSX rejects as a child.
 */
export default function PagePropsPage({ title, subtitle }: PageProps<typeof meta>) {
  const [count] = useState(5);
  const id = useId();

  return (
    <main>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <span data-hook-id={id}>{count}</span>
    </main>
  );
}
