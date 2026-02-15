import { messages } from "../messages/index.js";

/** @import { PageMeta } from "../types.d.ts" */

/**
 * @param {PageMeta} meta
 * @param {string} sourceFileName
 * @returns {PageMeta}
 */
export function validateMeta(meta, sourceFileName) {
	const issues = [];

	if (meta.title && typeof meta.title !== "string") {
		issues.push(
			`Invalid type for "title": expected string, got ${typeof meta.title}`,
		);
	}

	// Check layout (string, boolean, or undefined)
	if (meta.layout !== undefined) {
		const type = typeof meta.layout;
		if (type !== "string" && type !== "boolean") {
			issues.push(
				`Invalid type for "layout": expected string or boolean, got ${type}`,
			);
		}
	}

	if (issues.length > 0) {
		throw new Error(messages.errors.invalidMeta(sourceFileName, issues));
	}

	return meta;
}
