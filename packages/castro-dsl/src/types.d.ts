/**
 * The parser-agnostic node tree. The borrowed HTML parser is adapted to this
 * shape in `parse.js`; everything downstream (codegen) depends only on this,
 * never on the parser. Swapping the parser means rewriting `parse.js` to
 * produce these — and nothing else changes. See EXPLORATIONS.md.
 */

export type CNode = CElement | CText;

export interface CElement {
	type: "element";
	tag: string;
	/** attribute name → raw value (quotes already stripped by the parser) */
	attrs: Record<string, string>;
	children: CNode[];
}

export interface CText {
	type: "text";
	value: string;
}
