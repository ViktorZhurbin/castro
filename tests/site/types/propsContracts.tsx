/**
 * Type-Level Contract Pins
 *
 * `PageProps` and `LayoutProps` are what page and layout authors annotate with,
 * so what they promise is a contract like any other. Most of it pins itself
 * wherever the props are rendered — JSX rejects `unknown` as a child, so a
 * `PageProps<T>` that stopped narrowing goes red in `pages/page-props.tsx`.
 * `title` is the leg that doesn't: `string | undefined` is a perfectly valid
 * child, so only an annotation catches it turning optional.
 *
 * Lives under types/ for the same reason islandContracts.tsx does — it must be
 * type-checked but never built, and the fixtures next door are the reference
 * for what a real project looks like, which a pin like this is not.
 */

import type { LayoutProps, PageProps } from "@vktrz/castro";

// `title` is always supplied — renderPage.js derives it from the filename when
// frontmatter omits one — so it is required on both, with no type argument in
// sight. PageMeta's own `title?: string` is what this would decay to.
//
// Two pins rather than one: the same mutation reddens both today, since
// LayoutProps takes `title` through PageProps. Cut that derivation — spell
// LayoutProps as `PageMeta & T & { children }` — and only the layout one goes.
export function titleIsRequiredOnPages({ title }: PageProps) {
  const pinned: string = title;
  return pinned;
}

export function titleIsRequiredOnLayouts({ title }: LayoutProps) {
  const pinned: string = title;
  return pinned;
}
