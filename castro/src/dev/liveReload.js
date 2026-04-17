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

/** @import { CastroErrorPayload } from "../types.d.ts" */

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

		const style = document.createElement("style");
		style.textContent = `
			:host {
				position: fixed;
				inset: 0;
				z-index: 99999;
				background: rgba(0,0,0,0.9);
				color: #fff;
				font-family: monospace;
				font-size: 0.875rem;
				padding: 2rem;
				box-sizing: border-box;
				overflow-y: auto;
			}
			.title {
				color: #ff5f57;
				font-weight: bold;
				font-size: 1.2rem;
				margin-bottom: 0.5rem;
			}
			.message {
				color: #e8e8e8;
				margin-bottom: 1rem;
			}
			.notes {
				list-style: none;
				padding: 0;
				margin: 0.5rem 0 1rem 0;
				color: #bbb;
			}
			.notes li {
				padding-left: 1rem;
				text-indent: -0.5rem;
			}
			.notes li:before {
				content: "· ";
			}
			.frame {
				margin: 1rem 0;
				border: 1px solid #555;
				border-radius: 4px;
				background: rgba(50, 50, 50, 0.5);
				padding: 0.75rem;
			}
			.frame-file {
				color: #64b5f6;
				margin-bottom: 0.5rem;
				word-break: break-all;
			}
			.frame-file a {
				color: #64b5f6;
				text-decoration: none;
			}
			.frame-file a:hover {
				text-decoration: underline;
			}
			.frame-code {
				overflow-x: auto;
				background: rgba(0,0,0,0.3);
				padding: 0.5rem;
				border-radius: 3px;
				line-height: 1.5;
			}
			.line {
				display: flex;
			}
			.line-number {
				color: #666;
				width: 3em;
				text-align: right;
				padding-right: 1em;
				flex-shrink: 0;
			}
			.line-error .line-number {
				color: #ff5f57;
				background: rgba(255,95,87,0.1);
			}
			.line-text {
				flex: 1;
				color: #e8e8e8;
			}
			.line-error .line-text {
				color: #fff;
				background: rgba(255,95,87,0.1);
			}
			.caret-line {
				color: #ff5f57;
				padding-left: 1em;
			}
			.hint {
				margin-top: 1.5rem;
				padding-top: 1rem;
				border-top: 1px solid #444;
				color: #ffd54f;
			}
		`;

		this.shadowRoot.appendChild(style);

		// Title
		const title = document.createElement("div");
		title.className = "title";
		title.textContent = `❌ ${this.payload.title}`;
		this.shadowRoot.appendChild(title);

		// Message
		if (this.payload.message) {
			const message = document.createElement("div");
			message.className = "message";
			message.textContent = this.payload.message;
			this.shadowRoot.appendChild(message);
		}

		// Notes (bulleted list)
		if (this.payload.notes && this.payload.notes.length > 0) {
			const notesList = document.createElement("ul");
			notesList.className = "notes";
			for (const note of this.payload.notes) {
				const li = document.createElement("li");
				li.textContent = note;
				notesList.appendChild(li);
			}
			this.shadowRoot.appendChild(notesList);
		}

		// Frames (code snippets with line numbers)
		if (this.payload.frames && this.payload.frames.length > 0) {
			for (const frame of this.payload.frames) {
				const frameDiv = document.createElement("div");
				frameDiv.className = "frame";

				// File location
				const fileDiv = document.createElement("div");
				fileDiv.className = "frame-file";

				const absPath = frame.file;
				const relPath = absPath.replace(
					/^.*\/(pages|layouts|components)/,
					"$1",
				);
				const location = `${relPath}${frame.line ? `:${frame.line}` : ""}${frame.column ? `:${frame.column}` : ""}`;

				// Try to create VS Code link
				const link = document.createElement("a");
				link.href = `vscode://file/${absPath}${frame.line ? `:${frame.line}` : ""}${frame.column ? `:${frame.column}` : ""}`;
				link.textContent = location;
				link.onclick = (e) => {
					// In non-VS Code environments, prevent default
					if (!window.location.href.includes("vscode")) {
						e.preventDefault();
					}
				};

				fileDiv.appendChild(link);
				frameDiv.appendChild(fileDiv);

				// Code snippet
				if (frame.lineText) {
					const codeDiv = document.createElement("div");
					codeDiv.className = "frame-code";

					const lineNum = frame.line || 0;
					const lineStr = String(lineNum);

					// Show error line
					const errorLineDiv = document.createElement("div");
					errorLineDiv.className = "line line-error";

					const lineNumSpan = document.createElement("div");
					lineNumSpan.className = "line-number";
					lineNumSpan.textContent = lineNum > 0 ? String(lineNum) : "";
					errorLineDiv.appendChild(lineNumSpan);

					const lineTextSpan = document.createElement("div");
					lineTextSpan.className = "line-text";
					lineTextSpan.textContent = frame.lineText;
					errorLineDiv.appendChild(lineTextSpan);

					codeDiv.appendChild(errorLineDiv);

					// Caret line
					if (frame.column !== undefined && frame.column > 0) {
						const caretDiv = document.createElement("div");
						caretDiv.className = "caret-line";
						caretDiv.textContent = `${" ".repeat(frame.column)}^`;
						codeDiv.appendChild(caretDiv);
					}

					frameDiv.appendChild(codeDiv);
				}

				this.shadowRoot.appendChild(frameDiv);
			}
		}

		// Hint
		if (this.payload.hint) {
			const hint = document.createElement("div");
			hint.className = "hint";
			hint.textContent = `→ ${this.payload.hint}`;
			this.shadowRoot.appendChild(hint);
		}
	}
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
