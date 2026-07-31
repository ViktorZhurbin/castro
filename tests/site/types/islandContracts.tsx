/**
 * Type-Level Contract Pins
 *
 * Two island rules are enforced by the type system rather than at runtime, so
 * nothing that renders can cover them. Each `@ts-expect-error` below fails the
 * type-check if its rule ever loosens — that's the whole point of the file.
 *
 * Lives under types/ because it must be type-checked but never built: castro
 * only globs pages/, so nothing here reaches the output.
 */

import Counter from "../components/Counter.island.tsx";

// Directives are typed `true`, not `boolean` (see jsx.d.ts). There is no
// "don't hydrate" state, so `={false}` must be rejected outright rather than
// silently reading as the default directive.
// @ts-expect-error
export const noFalseDirective = <Counter initial={0} comrade:eager={false} />;

// Islands take props, never children. This one holds only while the island
// itself declares no `children` prop — declare one and TS waves it through,
// which is why marker.js throws ISLAND_HAS_CHILDREN at build time and that
// throw, not this line, is the actual enforcement.
// @ts-expect-error
export const noChildren = <Counter initial={0}>nested</Counter>;
