import { ClientScript } from "../ClientScript";
import { grammars, languageAliases } from "./syntaxGrammars";
import { syntaxHighlight } from "./syntaxHighlight";

import "./syntaxHighlight.css";

/**
 * Paints the docs' code blocks. Inlined rather than loaded from public/ so the
 * grammars stay type-checked and testable in src/ — ClientScript serializes
 * the function and passes the grammar data as JSON arguments.
 *
 * Rendered at the end of <body>: it reads the code blocks, so it must run
 * after they parse, and there is nothing to do before first paint.
 */
export function SyntaxHighlightScript() {
  return <ClientScript fn={syntaxHighlight} args={[grammars, languageAliases]} />;
}
