/**
 * Reactive primitives for castro-jsx framework.
 *
 * These type signatures match the SolidJS API surface — familiar to anyone
 * who has used fine-grained reactivity.
 */

// Internal types used by signals.js — not part of the public API
export type Effect = { dependencies: Set<Signal>; execute: () => void };
export type Signal = (() => unknown) & { subscribers: Set<Effect> };

// Public API — names follow SolidJS conventions
export type Accessor<T> = () => T;
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

export function createSignal<T>(
	initialValue: T,
): [get: Accessor<T>, set: Setter<T>];

export function createEffect(fn: () => void): void;
