/**
 * Reactive primitives — the shared foundation of the suite.
 *
 * Type signatures match the SolidJS API surface — familiar to anyone who has
 * used fine-grained reactivity. An accessor is a nullary function; everything
 * that wants to be reactive (signals, derived values, the JSX runtime, a future
 * store) speaks that one shape.
 */

// Internal types used by index.js — not part of the public API
export type Effect = { dependencies: Set<Signal>; execute: () => void };
export type Signal = (() => unknown) & { subscribers: Set<Effect> };

// Public API — names follow SolidJS conventions
export type Accessor<T> = () => T;
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

export function createSignal<T>(
	initialValue: T,
): [get: Accessor<T>, set: Setter<T>];

export function onMount(fn: () => void): void;

export function createEffect(fn: () => void): void;
