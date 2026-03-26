/**
 * Reactive primitives for Castro's bare-jsx framework.
 *
 * These type signatures match the SolidJS API surface — familiar to anyone
 * who has used fine-grained reactivity.
 */

// Internal types used by signals.js — not part of the public API
export type Effect = { dependencies: Set<Signal>; execute: () => void };
export type Signal = (() => unknown) & { subscribers: Set<Effect> };

export function createSignal<T>(
	initialValue: T,
): [get: () => T, set: (value: T | ((prev: T) => T)) => void];

export function createEffect(fn: () => void): void;

export function createMemo<T>(fn: () => T): () => T;
