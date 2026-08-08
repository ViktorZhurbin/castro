import { useId, useState } from "preact/hooks";

export const meta = { title: "Page Props", subtitle: "From frontmatter" };

/**
 * Pins the page-as-component contract: pages render through h(), so frontmatter
 * arrives as props and hooks have a dispatcher. Both threw before that change.
 */
export default function PageProps({ title, subtitle }: { title: string; subtitle?: string }) {
  const [count] = useState(5);
  const id = useId();

  return (
    <main>
      <h1>{title}</h1>
      <p>{String(subtitle)}</p>
      <span data-hook-id={id}>{count}</span>
    </main>
  );
}
