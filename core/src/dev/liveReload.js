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

// ─── Overlay ─────────────────────────────────────────────────────────────────

const OVERLAY_TAG = "castro-error-overlay";

// Parsed once and shared via adoptedStyleSheets rather than re-parsed from an
// inline <style> on every mount. Keeps the markup template free of CSS.
const overlaySheet = new CSSStyleSheet();
overlaySheet.replaceSync(`
  :host {
    position: fixed; inset: 0; z-index: 99999;
    padding: 2rem; overflow-y: auto;
    background: rgba(10, 10, 10, 0.95); color: #ccc;
    font: 0.875rem/1.6 ui-monospace, SFMono-Regular, Consolas, monospace;
  }
  a { color: #64b5f6; }
  .container { display: flex; flex-direction: column; gap: 1rem; }
  .title { color: #ff5f57; font-size: 1.2rem; font-weight: bold; }
  .message, .line-text { color: #fff; }
  .raw-error { color: #ff8a80; }
  .notes { list-style: "· "; padding-left: 1.5rem; color: #bbb; }
  .frame-code { margin-top: 0.5rem; overflow-x: auto; background: #111; padding: 0.5rem 0; border: 1px solid #444; }
  .line { display: flex; white-space: pre; }
  .line-num { width: 2rem; padding-right: 1rem; text-align: right; color: rgba(255, 255, 255, 0.4); flex-shrink: 0; }
  .caret { color: #ff5f57; }
  .hint { color: #ffd54f; }
`);

class CastroErrorOverlay extends HTMLElement {
	/** @type {CastroErrorPayload | null} */
	payload = null;

	constructor() {
		super();
		this.attachShadow({ mode: "open" }).adoptedStyleSheets = [overlaySheet];
	}

	connectedCallback() {
		if (!this.shadowRoot || !this.payload) return;

		this.shadowRoot.innerHTML = `
			<div class="container">
				<div class="title">❌ ${escapeHtml(this.payload.title)}</div>
				${this.payload.message ? `<div class="message">${escapeHtml(this.payload.message)}</div>` : ""}
				${this.payload.errorMessage ? `<div class="raw-error">${escapeHtml(this.payload.errorMessage)}</div>` : ""}

				${this.renderNotes(this.payload.notes)}
				${this.payload.frames?.map((f) => this.renderFrame(f)).join("") || ""}

				${this.payload.hint ? `<div class="hint">→ ${escapeHtml(this.payload.hint)}</div>` : ""}
			</div>
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

		if (frame.file) {
			const relPath = frame.file.replace(
				/^.*\/(pages|layouts|components)/,
				"$1",
			);
			const suffix = `${frame.line !== undefined ? `:${frame.line}` : ""}${frame.column !== undefined ? `:${frame.column}` : ""}`;

			const locationText = `${relPath}${suffix}`;
			const vsCodeUrl = `vscode://file/${frame.file}${suffix}`;

			header = `<a href="${escapeHtml(vsCodeUrl)}">${escapeHtml(locationText)}</a>`;
		} else if (frame.line !== undefined) {
			header = escapeHtml(
				`Line ${frame.line}${frame.column !== undefined ? `:${frame.column}` : ""}`,
			);
		}

		let codeSnippet = "";
		if (frame.lineText) {
			codeSnippet = `
        <div class="frame-code">
          <div class="line error-row">
            <div class="line-num">${frame.line || 0}</div>
            <div class="line-text">${escapeHtml(frame.lineText)}</div>
          </div>
          ${
						frame.column !== undefined
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

		return `
      <div>
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
