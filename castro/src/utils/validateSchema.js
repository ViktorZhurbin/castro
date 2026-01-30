/**
 * Validate an object against a simple schema
 *
 * Checks required fields and validates types. Supports single type or array of types.
 * This is a lightweight validation utility without external dependencies.
 *
 * @param {Record<string, any>} data - The object to validate
 * @param {Record<string, { type: string | string[], required?: boolean }>} schema - Schema definition
 * @returns {string[]} Array of error messages
 */

export function validateSchema(data, schema) {
	const errors = [];

	for (const [field, rules] of Object.entries(schema)) {
		const value = data[field];

		// Check required fields
		if (rules.required && (value === undefined || value === null)) {
			errors.push(`Missing required field: "${field}"`);
			continue;
		}

		// Skip type check if optional field is missing
		if (value === undefined || value === null) {
			continue;
		}

		// Check types (support single type or array of types)
		const expectedTypes = Array.isArray(rules.type) ? rules.type : [rules.type];
		const actualType = typeof value;

		if (!expectedTypes.includes(actualType)) {
			errors.push(
				`Invalid type for "${field}": expected ${expectedTypes.join(" or ")}, got ${actualType}`,
			);
		}
	}

	return errors;
}
