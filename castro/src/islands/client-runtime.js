/**
 * Client Runtime Helpers
 *
 * Utilities that run in the browser to support island hydration.
 *
 * Problem: HTML attributes are always strings, but components expect
 * typed props (numbers, booleans, objects). When we SSR a component,
 * we serialize props as data-* attributes. During hydration, we need
 * to deserialize them back to the correct types.
 *
 * Solution: These functions extract data-* attributes and intelligently
 * cast string values to their intended types.
 */

/**
 * @typedef {Record<string, unknown>} Props
 */

/**
 * Add a data prop to the props object with camelCase conversion and type casting
 *
 * Takes a kebab-case key and string value, converts key to camelCase,
 * casts value to proper type, and adds to props object.
 *
 * @param {Props} props - Props object to mutate
 * @param {string} key - Prop name in kebab-case (e.g., "my-count")
 * @param {string | null} value - String value to cast
 */
function addDataProp(props, key, value) {
	const camelKey = toCamelCase(key);
	props[camelKey] = castValue(value);
}

/**
 * Extract props from element's data-* attributes
 *
 * Example: <my-component data-count="5" data-name="hello">
 * Returns: { count: 5, name: "hello" }
 *
 * Example with kebab-case: <my-component data-my-count="5">
 * Returns: { myCount: 5 }
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
			addDataProp(props, propName, attr.value);
		}
	}

	return props;
}

/**
 * Extract props from an attributes string (used during SSR wrapping)
 *
 * Takes the raw HTML attribute string from a regex match and extracts
 * data-* attributes into a props object.
 *
 * Example: ' data-count="5" data-my-name="hello"'
 * Returns: { count: 5, myName: "hello" }
 *
 * @param {string} attrsString - Raw attributes string from HTML
 * @returns {Props}
 */
export function getPropsFromAttributeString(attrsString) {
	/** @type Props */
	const props = {};

	const dataAttrRegex = /data-([a-z0-9-]+)=["']([^"']*)["']/g;

	for (const [, key, value] of attrsString.matchAll(dataAttrRegex)) {
		addDataProp(props, key, value);
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
 * HTML attributes are always strings. This function uses heuristics
 * to convert them back to their intended types:
 * - "true"/"false" or empty -> boolean
 * - "42" or "3.14" -> number
 * - '{"key": "value"}' or '[1,2,3]' -> parsed JSON
 * - Everything else -> string
 *
 * Examples:
 *   data-count="5" → 5 (number)
 *   data-enabled → true (boolean, empty value)
 *   data-items='["a","b"]' → ["a","b"] (array)
 *
 * @param {string | null} val
 * @returns {unknown}
 */
export function castValue(val) {
	// Empty attributes like <tag data-active> have null or "" value
	if (val === "true" || val === "" || val === null) return true;

	if (val === "false") return false;

	// Try to parse as number (if it's numeric and not an empty string)
	const num = Number(val);
	if (val.trim() !== "" && !Number.isNaN(num)) return num;

	// Try to parse as JSON for arrays/objects
	if (val.startsWith("{") || val.startsWith("[")) {
		try {
			return JSON.parse(val);
		} catch {
			// Invalid JSON, fall through and return as string
		}
	}

	// Default: keep as string
	return val;
}
