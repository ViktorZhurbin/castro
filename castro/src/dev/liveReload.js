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

/** @import { CastroErrorPayload, CodeFrame } from "../types.d.ts" */

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
	const payload = /** @type {CastroErrorPayload} */ JSON.parse(event.data);

	showOverlay(payload);
});

/** @type EventSource["onerror"] */
events.onerror = () => {
	// Server disconnected - try to reconnect
	console.log("[castro] Lost connection, attempting to reconnect...");
};

// ─── Overlay ─────────────────────────────────────────────────────────────────

const OVERLAY_TAG = "castro-error-overlay";

class CastroErrorOverlay extends HTMLElement {
	/** @type {CastroErrorPayload | null} */
	payload = null;

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		if (!this.shadowRoot || !this.payload) return;

		this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(10, 10, 10, 0.95); color: #ccc;
          font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
          font-size: 0.875rem; line-height: 1.5;
          padding: 2rem; box-sizing: border-box; overflow-y: auto;
        }
        a { color: #64b5f6; text-decoration: none; }
        a:hover { text-decoration: underline; }

        .title { color: #ff5f57; font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .message { color: #fff; margin-bottom: 1rem; }

        .notes { list-style: "· "; padding-left: 1.5rem; color: #bbb; margin-bottom: 1rem; }

        .frame { margin: 1rem 0; padding: 1rem; background: #222; border: 1px solid #444; border-radius: 4px; }
        .frame-code { overflow-x: auto; margin-top: 0.75rem; background: #111; padding: 0.5rem; border-radius: 3px; }

        .line { display: flex; }
        .line-num { width: 3rem; text-align: right; padding-right: 1rem; color: #666; flex-shrink: 0; }
        .line-text { white-space: pre; color: #e8e8e8; }

        .error-row .line-num { color: #ff5f57; background: rgba(255, 95, 87, 0.1); }
        .error-row .line-text { color: #fff; background: rgba(255, 95, 87, 0.1); flex: 1; }
        .caret { color: #ff5f57; white-space: pre; }

        .hint { color: #ffd54f; margin-top: 1.5rem; border-top: 1px solid #444; padding-top: 1rem; }
      </style>

      <div class="title">❌ ${escapeHtml(this.payload.title)}</div>
      ${this.payload.message ? `<div class="message">${escapeHtml(this.payload.message)}</div>` : ""}

      ${this.renderNotes(this.payload.notes)}
      ${this.payload.frames?.map((f) => this.renderFrame(f)).join("") || ""}

      ${this.payload.hint ? `<div class="hint">→ ${escapeHtml(this.payload.hint)}</div>` : ""}
    `;
	}

	/**
	 * @param {string[] | undefined} notes
	 */
	renderNotes(notes) {
		if (!notes || !notes.length) return "";
		return `<ul class="notes">${notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`;
	}

	/**
	 * @param {CodeFrame} frame
	 */
	renderFrame(frame) {
		let header = "";

		// 1. Build the location header
		if (frame.file) {
			const relPath = frame.file.replace(
				/^.*\/(pages|layouts|components)/,
				"$1",
			);
			const suffix = `${frame.line ? `:${frame.line}` : ""}${frame.column ? `:${frame.column}` : ""}`;

			const locationText = `${relPath}${suffix}`;
			const vsCodeUrl = `vscode://file/${frame.file}${suffix}`;

			header = `<a href="${vsCodeUrl}">${escapeHtml(locationText)}</a>`;
		} else if (frame.line !== undefined) {
			header = escapeHtml(
				`Line ${frame.line}${frame.column ? `:${frame.column}` : ""}`,
			);
		}

		// 2. Build the code snippet (with caret fix)
		let codeSnippet = "";
		if (frame.lineText) {
			codeSnippet = `
        <div class="frame-code">
          <div class="line error-row">
            <div class="line-num">${frame.line || 0}</div>
            <div class="line-text">${escapeHtml(frame.lineText)}</div>
          </div>
          ${
						frame.column
							? `
          <div class="line">
            <div class="line-num"></div>
            <div class="caret">${" ".repeat(frame.column)}^</div>
          </div>`
							: ""
					}
        </div>
      `;
		}

		// 3. Assemble
		return `
      <div class="frame">
        ${header ? `<div>${header}</div>` : ""}
        ${codeSnippet}
      </div>
    `;
	}
}

/**
 * Escapes the four HTML-significant characters: & < > "
 * Single quotes are safe — attribute values are always double-quoted.
 * @param {string} str
 */
function escapeHtml(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

if (!customElements.get(OVERLAY_TAG)) {
	customElements.define(OVERLAY_TAG, CastroErrorOverlay);
}

/** @param {CastroErrorPayload} payload */
function showOverlay(payload) {
	removeOverlay();
	const overlay = /** @type {CastroErrorOverlay} */ (
		document.createElement(OVERLAY_TAG)
	);
	overlay.payload = payload;
	document.body.appendChild(overlay);
}

function removeOverlay() {
	document.querySelector(OVERLAY_TAG)?.remove();
}
