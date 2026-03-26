/**
 * Signals — Fine-Grained Reactive Primitives
 *
 * Automatic dependency tracking via a global listener context. When an
 * effect runs, it sets itself as the listener. Any signal read during
 * that execution subscribes the effect. When the signal changes, it
 * re-runs all subscribed effects — which re-track their dependencies
 * from scratch (enabling dynamic/conditional deps).
 *
 * Limitations (intentional, for simplicity):
 * - No effect disposal (effects live forever, can't be stopped once created)
 * - No batching (each write triggers subscribers immediately — deep
 *   dependency chains can cause cascading re-execution or stack overflow)
 * - No error boundaries
 */

/**
 * @import { Effect, Signal, createSignal, createEffect, createMemo } from "./index.d.ts"
 */

/**
 * The currently executing effect, or null. Signal reads during
 * execution subscribe this effect. See runWithTracking for the
 * save/restore that supports nesting.
 * @type {Effect | null}
 */
let listener = null;

/** Max re-entrant depth before we throw. Catches infinite loops from
 *  diamond dependencies or write-during-read patterns that would
 *  otherwise stack overflow silently. The limit is generous — real
 *  components rarely exceed 5-10 levels. */
const MAX_DEPTH = 100;
/** Current re-entrance level, incremented/decremented by runWithTracking */
let depth = 0;

/**
 * Creates a reactive signal — an observable value with automatic tracking.
 * Returns [getter, setter] tuple like React's useState.
 *
 * @type {createSignal}
 */
export function createSignal(initialValue) {
	let value = initialValue;

	/** @type {Set<Effect>} */
	const subscribers = new Set();

	/** Subscribe bidirectionally: effect → signal (for cleanup) and signal → effect (for notification) */
	function read() {
		if (listener) {
			subscribers.add(listener);
			listener.dependencies.add(/** @type {Signal} */ (read));
		}
		return value;
	}

	/**
	 * Updates the signal. Accepts a value or an updater function (prev → next).
	 * @param {any} nextValue
	 */
	function write(nextValue) {
		value = typeof nextValue === "function" ? nextValue(value) : nextValue;

		// Snapshot subscribers — an effect re-running may modify the set
		for (const effect of [...subscribers]) {
			effect.execute();
		}
	}

	// Expose subscribers so cleanup() can remove effects from this signal
	read.subscribers = subscribers;

	return [read, write];
}

/**
 * Creates a reactive effect that re-runs when its dependencies change.
 * Runs immediately on creation to establish initial subscriptions.
 *
 * @param {() => void} fn - The effect function to run
 */
export function createEffect(fn) {
	/** @type {Effect} */
	const effect = {
		dependencies: new Set(),
		execute() {
			runWithTracking(effect, fn);
		},
	};

	// Run immediately on creation
	effect.execute();
}

/**
 * Creates a memoized derived value — a signal that recomputes only
 * when its dependencies change. Acts as both an effect (tracks deps,
 * re-runs) and a signal (can be read, notifies subscribers).
 *
 * @type {createMemo}
 */
export function createMemo(fn) {
	/** @type {any} */
	let value;

	/** @type {Set<Effect>} */
	const subscribers = new Set();

	/**
	 * The memo acts as an effect (has dependencies, re-runs)
	 * @type {Effect}
	 */
	const memo = {
		dependencies: new Set(),

		execute() {
			const newValue = runWithTracking(memo, fn);

			// Only notify downstream if the value actually changed (memoization)
			if (newValue !== value) {
				value = newValue;
				for (const effect of [...subscribers]) {
					effect.execute();
				}
			}
		},
	};

	// Compute initial value
	memo.execute();

	// Same subscription logic as createSignal.read() — memos are readable signals
	function read() {
		if (listener) {
			subscribers.add(listener);
			listener.dependencies.add(read);
		}

		return value;
	}

	// Expose subscribers for cleanup
	read.subscribers = subscribers;

	return read;
}

/**
 * Runs a function with dependency tracking. Saves and restores the
 * listener so nested effects (createEffect inside createEffect) don't
 * clobber the outer context. Production systems like SolidJS use the
 * same push/pop pattern.
 *
 * Also enforces a depth limit to catch infinite loops from cascading
 * signal writes — the educational alternative to a full batch queue.
 *
 * @param {Effect} effect
 * @param {() => any} fn
 * @returns {any}
 */
function runWithTracking(effect, fn) {
	if (++depth > MAX_DEPTH) {
		depth = 0;
		throw new Error(
			"Reactive cycle detected: effect re-triggered itself beyond max depth. " +
				"This usually means a signal write inside an effect triggers the same effect.",
		);
	}

	cleanup(effect);

	// Push: save current listener, set this effect as active
	const prev = listener;
	listener = effect;
	try {
		return fn();
	} finally {
		// Pop: restore previous listener (supports nesting)
		listener = prev;
		depth--;
	}
}

/**
 * Removes an effect from all its dependencies' subscriber sets.
 * Called before re-running an effect so stale subscriptions are cleared.
 *
 * @param {Effect} effect
 */
function cleanup(effect) {
	for (const signal of effect.dependencies) {
		signal.subscribers.delete(effect);
	}
	effect.dependencies.clear();
}
