/**
 * Syntax highlighting with the CSS Custom Highlight API, in one function.
 *
 * Serialized via .toString() for the inline script rendered by
 * SyntaxHighlightScript.tsx — see ClientScript's docblock. Must stay
 * self-contained: no references outside its own parameters and browser
 * globals. That is why the grammars arrive as an argument rather than an
 * import, and why the helpers are nested.
 *
 * The mechanism, in three steps: tokenize a code block's text with one
 * combined regex, turn each match into a Range, and register the ranges under
 * a scope name in CSS.highlights. A `::highlight(scope)` rule then colors
 * them. No <span> is inserted, so the HTML the markdown pipeline emitted is
 * the HTML that stays in the DOM — copy, select, and view-source are
 * unaffected, and a theme switch recolors without re-running anything.
 *
 * Range offsets are per text node, so a block whose <code> holds anything but
 * one text node is skipped rather than mis-highlighted. Bun.markdown.html
 * emits exactly that shape (entities decode into the same node at parse
 * time); normalize() covers a block assembled some other way.
 */

import type { Grammar } from "./syntaxGrammars";

export function syntaxHighlight(
  grammars: Record<string, Grammar>,
  aliases: Record<string, string>,
) {
  // Unsupported browser: code blocks stay plain text, still readable.
  if (!CSS.highlights) return;

  /** scope name → the ranges to paint under it, across every block on the page. */
  const highlights = new Map<string, Highlight>();

  const compiled = new Map<string, RegExp>();
  const compile = (language: string) => {
    let regex = compiled.get(language);
    if (!regex) {
      const rules = grammars[language];
      // The `d` flag is what makes per-group offsets available.
      regex = new RegExp(rules.map(([scope, source]) => `(?<${scope}>${source})`).join("|"), "gd");
      compiled.set(language, regex);
    }
    return regex;
  };

  for (const code of document.querySelectorAll("pre > code")) {
    const className = [...code.classList].find((name) => name.startsWith("language-"));
    const language = aliases[className?.slice("language-".length) ?? ""];
    if (!language || !grammars[language]) continue;

    code.normalize();
    const node = code.firstChild;
    if (node?.nodeType !== Node.TEXT_NODE || node.nextSibling) continue;

    for (const match of (node as Text).data.matchAll(compile(language))) {
      // Exactly one named group participates per match; find it and use its span.
      for (const [scope, span] of Object.entries(match.indices?.groups ?? {})) {
        if (!span) continue;

        const range = new Range();
        range.setStart(node, span[0]);
        range.setEnd(node, span[1]);

        let highlight = highlights.get(scope);
        if (!highlight) highlights.set(scope, (highlight = new Highlight()));
        highlight.add(range);
        break;
      }
    }
  }

  for (const [scope, highlight] of highlights) CSS.highlights.set(scope, highlight);
}
