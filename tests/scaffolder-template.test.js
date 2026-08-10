/**
 * Scaffolder Template Drift
 *
 * The template isn't a workspace: nothing installs it and `bun check:code`
 * never type-checks it, so its tsconfig can drift from the canonical one in
 * `website/` and no build fails. Root CLAUDE.md says the two match — this
 * converts that into a failing assertion.
 *
 * `import()` rather than `Bun.file().json()`: both files carry comments, which
 * the JSON parser rejects and Bun's JSON module loader accepts.
 */

import { expect, test } from "bun:test";

import template from "../packages/create-castro/template/tsconfig.json";
import canonical from "../website/tsconfig.json";

test("the scaffolder template's compilerOptions match the canonical tsconfig", () => {
  // `paths` is the one documented difference: the template keeps pages/ and
  // layouts/ at the root where website/ nests them under src/.
  const { paths: canonicalPaths, ...canonicalOptions } = canonical.compilerOptions;
  const { paths: templatePaths, ...templateOptions } = template.compilerOptions;

  expect(templateOptions).toEqual(canonicalOptions);

  // Asserted rather than discarded, so a template that drops `paths` entirely
  // can't pass by making the subtraction vacuous.
  expect(canonicalPaths).toEqual({ "@/*": ["./src/*"] });
  expect(templatePaths).toEqual({ "@/*": ["./*"] });
});
