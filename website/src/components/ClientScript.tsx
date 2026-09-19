import { h } from "preact";

/**
 * A way to add an inline script in JSX with SSR. `fn` is serialized with
 * `.toString()` and called with `args` as JSON, so it must be self-contained:
 * no references outside its own parameters and browser globals.
 */
export function ClientScript(props: {
  args?: readonly unknown[];
  // oxlint-disable-next-line typescript/no-explicit-any
  fn: (...args: any[]) => unknown;
}) {
  const { fn, args = [] } = props;
  const argsString = args.map((a) => JSON.stringify(a)).join(", ");

  return h("script", {
    dangerouslySetInnerHTML: { __html: `(${fn.toString()})(${argsString});` },
  });
}
