/**
 * Client Runtime Helpers
 *
 * Utilities that run in the browser to support island hydration.
 * These help extract props from HTML attributes and convert them
 * to the right JavaScript types.
 *
 * Educational note: When we SSR a component, we encode its props
 * as data-* attributes. This file decodes them back when hydrating.
 */

/**
 * Extract props from element's data-* attributes
 *
 * Example: <my-component data-count="5" data-name="hello">
 * Returns: { count: 5, name: "hello" }
 *
 * @typedef {Record<string, unknown>} Props
 *
 * @param {NamedNodeMap} attributes - Element's attributes
 * @returns {Props}
 */
export function getPropsFromAttributes(attributes) {
	/** @type Props */
	const props = {};

	const DATA_PREFIX = "data-";
	for (const attr of Array.from(attributes)) {
		if (attr.name.startsWith(DATA_PREFIX)) {
			const propName = attr.name.slice(DATA_PREFIX.length);

			props[propName] = castValue(attr.value);
		}
	}

	return props;
}

/**
 * Convert kebab-case to camelCase
 *
 * Example: "my-prop-name" -> "myPropName"
 *
 * @param {string} str
 * @returns {string}
 */
export function toCamelCase(str) {
	return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * Cast string attribute value to proper JavaScript type
 *
 * Educational note: HTML attributes are always strings, but our
 * components expect real types. This function does smart conversion:
 * - "true"/"false" -> boolean
 * - "42" -> number
 * - '{"key": "value"}' -> object
 *
 * @param {string | null} val
 * @returns {unknown}
 */
export function castValue(val) {
	// Empty attributes like <tag data-active> become true
	if (val === "true" || val === "" || val === null) return true;

	if (val === "false") return false;

	// Try to parse as number
	const num = Number(val);
	if (val.trim() !== "" && !Number.isNaN(num)) return num;

	// Try to parse as JSON (for arrays/objects)
	if (val.startsWith("{") || val.startsWith("[")) {
		try {
			return JSON.parse(val);
		} catch {
			return undefined;
		}
	}

	return val;
}
