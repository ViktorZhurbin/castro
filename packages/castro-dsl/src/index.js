/**
 * castro-dsl — compile a `.castro` source string into a JS module.
 *
 * The pipeline, rhyming with castro's build: split the `---` frontmatter,
 * parse the template (swappable seam in parse.js), emit `createElement` calls
 * (the judgment pass in codegen.js), assemble the module. The emitted module's
 * default export is a `Component()` that returns a DOM node when run against
 * the castro-jsx runtime.
 *
 * Frontmatter is split into imports (hoisted to module scope) and setup (kept
 * inside `Component`, so each mount gets its own signals). v0 assumes
 * single-line imports.
 */

import { emit } from "./codegen.js";
import { parse } from "./parse.js";

const RUNTIME = "@vktrz/castro-jsx";

/**
 * @param {string} source
 * @returns {string}
 */
export function compile(source) {
	const { frontmatter, template } = splitFrontmatter(source);
	const { imports, setup } = hoistImports(frontmatter);
	const body = emit(parse(template));

	const head = [
		`import { createElement, Fragment } from "${RUNTIME}";`,
		imports,
	]
		.filter(Boolean)
		.join("\n");

	const inner = [indent(setup), `\treturn ${body};`].filter(Boolean).join("\n");

	return `${head}\n\nexport default function Component() {\n${inner}\n}\n`;
}

/**
 * @param {string} source
 * @returns {{ frontmatter: string, template: string }}
 */
function splitFrontmatter(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { frontmatter: "", template: source };
	return { frontmatter: match[1], template: source.slice(match[0].length) };
}

/**
 * Imports must live at module scope; everything else is per-instance setup.
 *
 * @param {string} frontmatter
 * @returns {{ imports: string, setup: string }}
 */
function hoistImports(frontmatter) {
	/** @type {string[]} */
	const imports = [];
	/** @type {string[]} */
	const setup = [];
	for (const line of frontmatter.split("\n")) {
		(/^\s*import\s/.test(line) ? imports : setup).push(line);
	}
	return { imports: imports.join("\n").trim(), setup: setup.join("\n").trim() };
}

/** @param {string} block */
function indent(block) {
	if (!block) return "";
	return block
		.split("\n")
		.map((line) => (line ? `\t${line}` : line))
		.join("\n");
}
