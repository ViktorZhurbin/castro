/**
 * User Configuration
 *
 * Shape of the optional castro.config.js file.
 * All fields are optional — sensible defaults are applied.
 */

export interface CastroConfig {
	/** Dev server port (default: 3000) */
	port?: number;

	/** Message preset — "satirical" for communist theme, "serious" for plain (default: "satirical") */
	messages?: "satirical" | "serious";
}

/** Resolved configuration with defaults applied */
export const config: Required<CastroConfig>;

/** Reload configuration from castro.config.js (used by dev server on file change) */
export function loadConfig(): Promise<void>;
