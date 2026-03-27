/**
 * Castro Type Declarations
 *
 * Declares island hydration directives as valid props on all Preact components.
 */

declare module "preact" {
	namespace JSX {
		interface IntrinsicAttributes {
			/**
			 * Immediate hydration - loads JavaScript immediately on page load.
			 * Use for critical interactive elements like navigation or search.
			 *
			 * @example
			 * ```tsx
			 * <Counter initial={5} lenin:awake />
			 * ```
			 */
			"lenin:awake"?: boolean;

			/**
			 * Idle hydration - loads JavaScript after page load, when browser is idle.
			 * Uses requestIdleCallback for efficient scheduling.
			 * Best for important above-the-fold content that isn't critical-path.
			 *
			 * @example
			 * ```tsx
			 * <Counter initial={5} comrade:idle />
			 * ```
			 */
			"comrade:idle"?: boolean;

			/**
			 * Lazy hydration - loads JavaScript when component scrolls into viewport.
			 * This is the DEFAULT behavior if no directive is specified.
			 *
			 * Uses IntersectionObserver for efficient viewport detection.
			 * Best for below-the-fold interactive content.
			 *
			 * @example
			 * ```tsx
			 * // Explicit:
			 * <Counter initial={5} comrade:visible />
			 * // Or implicit (same result):
			 * <Counter initial={5} />
			 * ```
			 */
			"comrade:visible"?: boolean;
		}
	}
}

export {};
