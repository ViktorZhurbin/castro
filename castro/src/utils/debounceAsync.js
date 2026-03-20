/**
 * Debounced async runner.
 *
 * Collapses rapid `schedule()` calls into a single execution of `fn`.
 * If `schedule()` is called while `fn` is running, `fn` runs once more
 * after the current pass finishes. Builds never overlap.
 *
 * @param {() => Promise<void>} fn - Async work to run
 * @param {number} ms - Debounce delay in milliseconds
 * @param {{ onComplete?: () => void }} [options]
 */
export function debounceAsync(fn, ms, options = {}) {
	/** @type {ReturnType<typeof setTimeout> | null} */
	let timer = null;

	/** Resolves when the current fn() call finishes. Null when idle. */
	/** @type {Promise<void> | null} */
	let active = null;

	async function flush() {
		timer = null;

		// Wait for any in-progress run, then go again
		if (active) {
			await active;
			return flush();
		}

		active = fn();
		await active;
		active = null;

		options.onComplete?.();
	}

	return {
		schedule() {
			if (timer) clearTimeout(timer);
			timer = setTimeout(flush, ms);
		},
	};
}
