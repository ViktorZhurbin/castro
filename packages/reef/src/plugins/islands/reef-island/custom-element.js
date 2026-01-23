const ELEMENT_TAG = "reef-island";
/**
 * ReefIsland - Custom element for lazy-loading interactive components
 * Simplified island architecture without global registry
 */
class ReefIsland extends HTMLElement {
	constructor() {
		super();
		this._hydrated = false;
	}

	async connectedCallback() {
		// Only hydrate once
		if (this._hydrated) return;

		// Wait for trigger condition
		if (this.hasAttribute("on:visible")) {
			await this.waitVisible();
		}

		// Load and mount component
		await this.hydrate();
	}

	/** @returns {Promise<void>} */
	waitVisible() {
		return new Promise((resolve) => {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						observer.disconnect();
						resolve();
					}
				},
				{ rootMargin: "100px" }, // Start loading before visible
			);
			observer.observe(this);
		});
	}

	async hydrate() {
		if (this._hydrated) return;

		this._hydrated = true;

		try {
			const importPath = this.getAttribute("import");
			if (!importPath) {
				console.error(`${ELEMENT_TAG}: missing import attribute`);
				return;
			}

			// Import the module
			const module = await import(importPath);

			const target = this.firstElementChild;

			// Call mounting function with the child element (e.g., <preact-counter>)
			// This allows static HTML to be replaced with interactive component
			if (typeof module.default === "function" && target) {
				await module.default(target);
			} else {
				console.error(`${ELEMENT_TAG}: module must export mounting function`);
			}

			// Mark as ready
			this.setAttribute("ready", "");
		} catch (err) {
			console.error(`${ELEMENT_TAG}: hydration failed`, err);
		}
	}
}

// Register custom element
if (!customElements.get(ELEMENT_TAG)) {
	customElements.define(ELEMENT_TAG, ReefIsland);
}
