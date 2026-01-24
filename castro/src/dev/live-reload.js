/**
 * Live Reload Client
 *
 * This runs in the BROWSER during development.
 * It listens for server events and reloads the page when files change.
 *
 * Educational note: Server-Sent Events (SSE) is simpler than WebSockets
 * for one-way communication. The server pushes events, the client listens.
 */

import { LiveReloadEvents } from "./live-reload-events.js";

// Connect to SSE endpoint
const events = new EventSource("/events");

/** @type EventSource["onmessage"] */
events.onmessage = (event) => {
	if (event.data === LiveReloadEvents.Reload) {
		window.location.reload();
	}
};

/** @type EventSource["onerror"] */
events.onerror = () => {
	// Server disconnected - try to reconnect
	console.log("[castro] Lost connection, attempting to reconnect...");
};
