/**
 * Castro Island - Custom Element for Lazy Hydration
 *
 * This is the CLIENT-SIDE runtime that makes islands interactive.
 * It's a Web Component that wraps your framework components and
 * handles when/how they become interactive.
 *
 * Educational note: This is the core of island architecture!
 * Instead of loading all JavaScript upfront, we:
 * 1. Serve static HTML (fast initial load)
 * 2. Wait for a trigger condition (visible, idle, etc.)
 * 3. Only then load and "hydrate" the component
 *
 * The result: pages load fast, and JS is loaded incrementally.
 */

const ELEMENT_TAG = "castro-island";

class CastroIsland extends HTMLElement {
	constructor() {
		super();
		this._hydrated = false;
	}

	async connectedCallback() {
		// Only hydrate once
		if (this._hydrated) return;

		// Wait for trigger condition based on directive
		// Currently supports: comrade:visible (IntersectionObserver)
		// Future: lenin:awake (immediate), party:priority (high priority)
		if (this.hasAttribute("comrade:visible")) {
			await this.waitVisible();
		}

		// Load and mount component
		await this.hydrate();
	}

	/**
	 * Wait until element is visible in viewport
	 * Uses IntersectionObserver for efficient visibility detection
	 *
	 * Educational note: IntersectionObserver is more efficient than
	 * scroll event listeners. The browser handles the heavy lifting.
	 *
	 * @returns {Promise<void>}
	 */
	waitVisible() {
		return new Promise((resolve) => {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						observer.disconnect();
						resolve();
					}
				},
				{ rootMargin: "100px" }, // Start loading slightly before visible
			);
			observer.observe(this);
		});
	}

	/**
	 * Hydrate the island - load JS and make it interactive
	 *
	 * Educational note: "Hydration" means attaching JavaScript
	 * behavior to existing HTML. The HTML was rendered at build
	 * time (SSR), now we're adding interactivity.
	 */
	async hydrate() {
		if (this._hydrated) return;

		this._hydrated = true;

		try {
			const importPath = this.getAttribute("import");
			if (!importPath) {
				console.error(`${ELEMENT_TAG}: missing import attribute`);
				return;
			}

			// Dynamically import the component module
			const module = await import(importPath);

			const target = this.firstElementChild;

			// Call the mounting function with the target element
			// The mounting function handles framework-specific hydration
			if (typeof module.default === "function" && target) {
				await module.default(target);
			} else {
				console.error(`${ELEMENT_TAG}: module must export mounting function`);
			}

			// Mark as ready (useful for CSS styling)
			this.setAttribute("ready", "");
		} catch (err) {
			console.error(`${ELEMENT_TAG}: hydration failed`, err);
		}
	}
}

// Register custom element
if (!customElements.get(ELEMENT_TAG)) {
	customElements.define(ELEMENT_TAG, CastroIsland);
}
