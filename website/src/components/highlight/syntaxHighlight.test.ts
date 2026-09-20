/**
 * Tests for syntaxHighlight()'s scope assignment. The function talks to
 * Range/Highlight/CSS.highlights directly, so the test stubs those the way
 * themeInit.test.ts stubs localStorage: what ships is what runs here.
 *
 * The cases that matter are precedence ones — a keyword inside a comment or a
 * string must not tokenize as a keyword — plus the single-text-node guard,
 * which is the difference between correct offsets and silently wrong ones.
 */
import { beforeEach, expect, test } from "bun:test";

import { grammars, languageAliases } from "./syntaxGrammars";
import { syntaxHighlight } from "./syntaxHighlight";

/** scope → the substrings painted under it. */
let painted: Map<string, string[]>;
let blocks: { language: string; code: string; nodes?: number }[];

/** Builds the smallest DOM surface syntaxHighlight() touches. */
function stubDom() {
  painted = new Map();

  const elements = blocks.map(({ language, code, nodes = 1 }) => {
    const text = { nodeType: 3, data: code, nextSibling: nodes > 1 ? {} : null };
    return {
      classList: [`language-${language}`],
      normalize() {},
      firstChild: text,
      text,
    };
  });

  globalThis.Node = { TEXT_NODE: 3 } as never;
  globalThis.document = {
    querySelectorAll: () => elements,
  } as never;

  globalThis.Range = class {
    node!: { data: string };
    start = 0;
    end = 0;
    setStart(node: { data: string }, offset: number) {
      this.node = node;
      this.start = offset;
    }
    setEnd(_node: unknown, offset: number) {
      this.end = offset;
    }
  } as never;

  globalThis.Highlight = class {
    ranges: { node: { data: string }; start: number; end: number }[] = [];
    add(range: { node: { data: string }; start: number; end: number }) {
      this.ranges.push(range);
    }
  } as never;

  // The scope name is only known at registration time, so the stub labels
  // each Highlight's collected ranges here rather than on add().
  globalThis.CSS = {
    highlights: {
      set(
        scope: string,
        highlight: { ranges: { node: { data: string }; start: number; end: number }[] },
      ) {
        painted.set(
          scope,
          highlight.ranges.map((r) => r.node.data.slice(r.start, r.end)),
        );
      },
    },
  } as never;
}

/** Runs the highlighter over one block and returns scope → painted text. */
function run(language: string, code: string, nodes = 1) {
  blocks = [{ language, code, nodes }];
  stubDom();
  syntaxHighlight(grammars, languageAliases);
  return painted;
}

beforeEach(() => {
  painted = new Map();
});

test("keywords, strings and comments get distinct scopes", () => {
  const out = run("ts", 'const x = "hi"; // note');

  expect(out.get("keyword")).toEqual(["const"]);
  expect(out.get("string")).toEqual(['"hi"']);
  expect(out.get("comment")).toEqual(["// note"]);
});

test("a keyword inside a comment or a string is not a keyword", () => {
  const out = run("ts", '// const here\nlet s = "const there";');

  expect(out.get("keyword")).toEqual(["let"]);
  expect(out.get("comment")).toEqual(["// const here"]);
  expect(out.get("string")).toEqual(['"const there"']);
});

test("a keyword inside an identifier is not a keyword", () => {
  const out = run("ts", "constant.iffy(typeofish);");

  expect(out.get("keyword")).toBeUndefined();
});

test("shell fences use the shell grammar", () => {
  const out = run("sh", "bun run build --watch # go");

  expect(out.get("comment")).toEqual(["# go"]);
  // The first word of the line is the command; everything up to the comment is
  // its arguments, flags included.
  expect(out.get("command")).toEqual(["bun"]);
  expect(out.get("argument")).toEqual(["run", "build", "--watch"]);
});

test("a shell line starting with a keyword is not a command", () => {
  const out = run("sh", "cd site\nif true; then\n  bun run dev\nfi");

  expect(out.get("keyword")).toEqual(["if", "then", "fi"]);
  expect(out.get("command")).toEqual(["cd", "bun"]);
});

test("an import clause outranks the type rule at the same position", () => {
  const out = run(
    "tsx",
    'import type { LayoutProps } from "@vktrz/castro";\n' +
      "export default function Layout({ title }: LayoutProps) {\n" +
      "  return <main>Count: {title}</main>;\n" +
      "}",
  );

  // The clause takes the import scope; the annotation is a type.
  expect(out.get("imported")).toEqual(["LayoutProps"]);
  expect(out.get("type")).toEqual(["LayoutProps"]);
  expect(out.get("tag")).toEqual(["main", "main"]);
  expect(out.get("function")).toEqual(["Layout"]);
});

test("an import clause is painted, its later uses by position", () => {
  const out = run(
    "tsx",
    'import { useState } from "preact/hooks";\n' +
      'import Counter from "../components/Counter.island";\n' +
      "// Counter here is a comment\n" +
      "const [n] = useState(0);\n" +
      "const el = <Counter initial={n} />;",
  );

  expect(out.get("imported")).toEqual(["useState", "Counter"]);
  expect(out.get("function")).toEqual(["useState"]);
  expect(out.get("tag")).toEqual(["Counter"]);
  // A name inside a comment or an import path belongs to the token that
  // started earlier, so neither is a clause name.
  expect(out.get("comment")).toEqual(["// Counter here is a comment"]);
  expect(out.get("string")).toEqual(['"preact/hooks"', '"../components/Counter.island"']);
});

test("a JSX attribute is not a keyword", () => {
  const out = run("tsx", '<div class="card" for={id} hidden>text</div>');

  expect(out.get("attribute")).toEqual(["class", "for"]);
  expect(out.get("keyword")).toBeUndefined();
  expect(out.get("tag")).toEqual(["div", "div"]);
});

test("markdown fences paint headings and frontmatter keys only", () => {
  const out = run(
    "md",
    "---\ntitle: About\nlayout: docs\n---\n\n# About\n\nSome text. # not a heading\nNote: not a key\n",
  );

  expect(out.get("heading")).toEqual(["# About"]);
  expect(out.get("key")).toEqual(["title", "layout"]);
  expect(out.size).toBe(2);
});

test("an unmapped language is left alone", () => {
  expect(run("text", "const x = 1").size).toBe(0);
  expect(run("json", '{ "a": 1 }').size).toBe(0);
});

test("a block with more than one child node is skipped", () => {
  expect(run("ts", "const x = 1", 2).size).toBe(0);
});
