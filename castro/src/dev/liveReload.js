/**
 * Live Reload Client
 *
 * This runs in the BROWSER during development.
 *
 * Normal flow:
 * 1. Opens EventSource connection to /events endpoint
 * 2. Server keeps connection alive and watches file system
 * 3. On successful build: server sends "reload" → browser reloads
 * 4. On failed build: server sends "build-error" → overlay appears in-page,
 *    no reload. Overlay auto-removes when the next successful build fires.
 *
 * Keeping the page alive on error (no reload) means the SSE connection stays
 * open, so the fix-save reload is guaranteed to reach the browser.
 *
 * Uses Server-Sent Events (SSE) — simpler than WebSockets for one-way
 * server→client messaging.
 */

// Connect to SSE endpoint
const events = new EventSource("/events");

/** @type EventSource["onmessage"] */
events.onmessage = (event) => {
	if (event.data === "reload") {
		removeOverlay();
		window.location.reload();
	}
};

events.addEventListener("build-error", (event) => {
	const message = /** @type {string} */ JSON.parse(event.data);

	showOverlay(message);
});

/** @type EventSource["onerror"] */
events.onerror = () => {
	// Server disconnected - try to reconnect
	console.log("[castro] Lost connection, attempting to reconnect...");
};

// ─── Overlay ─────────────────────────────────────────────────────────────────

const OVERLAY_TAG = "castro-error-overlay";

class CastroErrorOverlay extends HTMLElement {
	message = "";

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		if (!this.shadowRoot) return;

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					position: fixed;
					inset: 0;
					z-index: 99999;
					background: rgba(0,0,0,0.85);
					color: #fff;
					font-family: monospace;
					font-size: 0.875rem;
					display: flex;
					flex-direction: column;
					gap: 1rem;
					padding: 2rem;
					box-sizing: border-box;
					overflow-y: auto;
				}
				.header {
					color: #ff5f57;
					font-weight: bold;
					font-size: 1.2rem;
				}
				pre {
					margin: 0;
					white-space: pre-wrap;
					word-break: break-word;
					line-height: 1.6;
				}
			</style>

			<div class="header">Build error — fix to continue</div>
			<pre>${this.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
		`;
	}
}

if (!customElements.get(OVERLAY_TAG)) {
	customElements.define(OVERLAY_TAG, CastroErrorOverlay);
}

/** @param {string} message */
function showOverlay(message) {
	removeOverlay();
	const overlay = /** @type {CastroErrorOverlay} */ (
		document.createElement(OVERLAY_TAG)
	);
	// HTML attributes have length limits in some browsers and error messages can be long.
	// Pass it as a property instead of using setAttribute
	overlay.message = message;
	document.body.appendChild(overlay);
}

function removeOverlay() {
	document.querySelector(OVERLAY_TAG)?.remove();
}
