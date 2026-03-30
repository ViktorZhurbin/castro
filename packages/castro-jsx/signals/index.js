/**
 * Signals — Fine-Grained Reactive Primitives
 *
 * 1. GLOBAL CONTEXT TRACKING
 *    A `listener` variable tracks which effect is currently executing.
 *    When a signal is read during execution, it subscribes the listener.
 *
 * 2. BIDIRECTIONAL CONNECTIONS
 *    Signals → Subscribers (forward): "when I change, notify these effects"
 *    Effects → Dependencies (backward): "I depend on these signals" (for cleanup)
 *
 * 3. DYNAMIC DEPENDENCIES
 *    Before re-running, effects clean up old subscriptions. During re-run,
 *    new subscriptions form based on which signals are actually read —
 *    so conditional logic (if/else) can change deps at runtime.
 *
 * Core pattern: cleanup → set listener → execute → subscribe
 *
 * Limitations (intentional, for simplicity):
 * - No effect disposal (effects live forever once created)
 * - No batching (each write triggers subscribers immediately)
 * - No error boundaries
 */

/**
 * @import { Effect, Signal, Accessor, Setter } from "./index.d.ts"
 */

/** @type {Effect | null} */
let listener = null;

/** Catches infinite loops from cascading signal writes. Real components
 *  rarely exceed 5-10 levels — 100 is generous. */
const MAX_DEPTH = 100;
let depth = 0;

/**
 * @template T
 * @param {T} initialValue
 * @returns {[get: Accessor<T>, set: Setter<T>]}
 */
export function createSignal(initialValue) {
	let value = initialValue;

	/** @type {Set<Effect>} */
	const subscribers = new Set();

	/** @type {Accessor<T>} */
	function read() {
		if (listener) {
			// Subscribe bidirectionally:
			//  - effect → signal (for cleanup)
			//  - signal → effect (for notification)
			subscribers.add(listener);
			listener.dependencies.add(/** @type {Signal} */ (read));
		}
		return value;
	}

	/** @type {Setter<T>} */
	function write(nextValue) {
		value = typeof nextValue === "function" ? nextValue(value) : nextValue;

		// Snapshot — an effect re-running may modify the subscriber set
		for (const effect of [...subscribers]) {
			effect.execute();
		}
	}

	read.subscribers = subscribers;

	return [read, write];
}

/**
 * Creates a reactive effect that re-runs when its dependencies change.
 * Runs immediately to establish initial subscriptions.
 *
 * @param {() => void} fn
 */
export function createEffect(fn) {
	/** @type {Effect} */
	const effect = {
		dependencies: new Set(),
		execute() {
			runWithTracking(effect, fn);
		},
	};

	effect.execute();
}

/**
 * Executes `fn` with dependency tracking. Enforces a depth limit
 * to catch infinite loops — the educational alternative to a batch queue.
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

	// Save and restore listener so nested effects don't
	// clobber the outer tracking context
	const prev = listener;
	listener = effect;
	try {
		return fn();
	} finally {
		listener = prev;
		depth--;
	}
}

/**
 * Removes an effect from all its dependencies' subscriber sets.
 * Called before re-running so stale subscriptions are cleared.
 *
 * @param {Effect} effect
 */
function cleanup(effect) {
	for (const signal of effect.dependencies) {
		signal.subscribers.delete(effect);
	}
	effect.dependencies.clear();
}
