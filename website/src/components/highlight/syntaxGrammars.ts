/**
 * Grammar data for syntaxHighlight().
 *
 * A grammar is an ordered list of `[scope, regexSource]` pairs. The order is
 * the precedence: syntaxHighlight joins them into one alternation, so the
 * first pair that matches at a given position wins. Comments and strings come
 * first for that reason — a `const` inside a string must not tokenize as a
 * keyword.
 *
 * Plain data, not RegExp objects, because these are serialized through
 * ClientScript's JSON args. Each pattern must use non-capturing groups only:
 * syntaxHighlight wraps every source in a named group and reads the match back
 * by name, so a nested named group would collide.
 *
 * Scope names are deliberately plain (`keyword`, `string`) — they are the
 * public surface the ::highlight() rules in syntaxHighlight.css select on.
 */

export type Grammar = readonly (readonly [scope: string, source: string])[];

/** Covers ts, tsx, typescript, js, jsx. One rule set, close enough for docs. */
const typescript: Grammar = [
  ["comment", String.raw`//[^\n]*|/\*[\s\S]*?\*/`],
  ["string", String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\`\\]|\\.)*\``],
  // The names an import clause binds: everything between `import` and `from`
  // that isn't clause syntax. Bounded to one line, so a multi-line clause is
  // missed — the docs have none, and the alternative is tracking state the
  // tokenizer doesn't keep. Only the clause is painted: a later use of the
  // name takes whatever scope its position gives it, `tag` or `function`.
  [
    "imported",
    String.raw`(?<=\bimport\b[^;\n]*?)\b(?!(?:type|as|default|from)\b)[A-Za-z_$][\w$]*\b(?=[^;\n]*?\bfrom\b)`,
  ],
  // JSX element names, from the `<` or `</` that precedes them.
  ["tag", String.raw`(?<=<\/?)(?!typeof\b)[A-Za-z][\w.-]*`],
  // An attribute name: a word assigned a string or a brace expression. Before
  // `keyword`, because `class` and `for` are attribute names in JSX and
  // keywords everywhere else. A plain `const x = "s"` matches this too, which
  // costs nothing — the scope carries no colour, and `x` was ink either way.
  ["attribute", String.raw`\b[A-Za-z_][\w-]*(?=\s*=\s*["{])`],
  [
    "keyword",
    String.raw`\b(?:import|export|from|default|function|return|const|let|var|if|else|for|while|new|class|extends|implements|typeof|instanceof|interface|type|enum|as|satisfies|keyof|infer|declare|namespace|async|await|of|in|this|super|throw|try|catch|finally|switch|case|break|continue|do|delete|void|yield|static|public|private|protected|readonly)\b`,
  ],
  ["constant", String.raw`\b(?:true|false|null|undefined|NaN|Infinity)\b`],
  ["number", String.raw`\b(?:0[xXbBoO][0-9a-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)\b`],
  // Capitalized identifier where a type or a component name can appear: after
  // an annotation colon, a type operator, or an opening brace/paren/comma (an
  // import specifier, an argument). Matching every capitalized word instead
  // would also paint JSX text content, which is prose, not code — `>Count:`
  // is excluded by exactly that. `imported` comes first, so a name in an
  // import clause stays a clause name.
  [
    "type",
    String.raw`(?<=[:,({]\s*|\bas\s+|\bsatisfies\s+|\bextends\s+|\bimplements\s+|\bnew\s+)[A-Z][\w$]*`,
  ],
  // The primitive type names, which `type` misses because it requires a
  // capital. Its own scope rather than a second `type` entry: syntaxHighlight
  // wraps each source in a named group, and two groups named `type` is a
  // SyntaxError. Both scopes get the same colour. `void` and `undefined` are
  // absent — `keyword` and `constant` claim them first, which is where they
  // read best. Unlike `type`, this rule carries no positional guard, so the
  // word `object` in JSX text content would paint — accepted, because a
  // lookbehind covering every position a primitive appears in is longer than
  // the rule it guards.
  ["builtin", String.raw`\b(?:string|number|boolean|bigint|symbol|object|unknown|never|any)\b`],
  // Identifier in call position. After `keyword`, so `if (` stays a keyword,
  // and `(` only — a `<` lookahead would paint the left side of `a < b`.
  ["function", String.raw`\b[A-Za-z_$][\w$]*(?=\s*\()`],
];

const shell: Grammar = [
  ["comment", String.raw`#[^\n]*`],
  ["string", String.raw`"(?:[^"\\]|\\.)*"|'[^']*'`],
  ["variable", String.raw`\$\{[^}]*\}|\$[A-Za-z_]\w*`],
  [
    "keyword",
    String.raw`\b(?:if|then|elif|else|fi|for|in|do|done|while|until|case|esac|function|return|export|local|source)\b`,
  ],
  // The first word of a line: `bun`, `npm`, `cd`. Without this a docs shell
  // block is nothing but a comment. After `keyword`, so a line starting with
  // `if` stays a keyword. The combined regex has no `m` flag, so the line
  // start is spelled out rather than left to `^`.
  ["command", String.raw`(?<=(?:^|\n)[ \t]*)[A-Za-z][\w.-]*`],
  // Everything the command is given: subcommands, paths, flags. One scope,
  // because a docs reader needs to see where the command ends, not which kind
  // of argument each word is. After `command`, which claims the first word of
  // a line at the same position; the lookbehind is a space or tab rather than
  // `\s` so an unindented command is not a candidate at all. The excluded
  // characters are the shell's own punctuation and the start of a comment.
  ["argument", String.raw`(?<=[ \t])[^\s#|&;<>]+`],
];

/**
 * Headings and frontmatter keys. A markdown fence in the docs is there to show
 * file shape, and those two are the shape; painting emphasis or links on top
 * says nothing the reader needs. A heading's hashes are part of the match
 * because they are the markup.
 *
 * The frontmatter rule is bounded by its lookbehind rather than by a state
 * machine the tokenizer doesn't have: the key must sit after an opening `---`
 * line with no `---` between, and the combined regex carries no `m` flag, so
 * `^` is the start of the block. A `Note:` line in the prose below is left
 * alone by exactly that.
 */
const markdown: Grammar = [
  ["heading", String.raw`(?<=^|\n)#{1,6} [^\n]*`],
  // Its own scope, not `property`: that one is every identifier before a
  // colon in TypeScript, and painting object keys blue is a separate call.
  ["key", String.raw`(?<=^---\n(?:(?!---)[^\n]*\n)*)[A-Za-z_][\w-]*(?=:)`],
];

/**
 * Languages with no entry here are left unhighlighted — that is the intended
 * outcome for the docs' `text` fences, not a gap.
 */
export const grammars: Record<string, Grammar> = { typescript, shell, markdown };

/** `language-*` class suffix → key in `grammars`. */
export const languageAliases: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  js: "typescript",
  jsx: "typescript",
  javascript: "typescript",
  sh: "shell",
  bash: "shell",
  shell: "shell",
  md: "markdown",
  markdown: "markdown",
};
