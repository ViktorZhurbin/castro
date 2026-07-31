import { CastroError } from "./errors.js";

/** @import { CodeFrame } from "../types.d.ts" */

/**
 * Wraps Bun.build to standardize error handling.
 *
 * Bun.build can fail in two shapes. Both paths will emit structured
 * BUNDLE_FAILED errors with code frames extracted from build logs:
 *
 *  - Soft failure: returns `{ success: false, logs: [...] }`
 *  - Hard failure: throws AggregateError with `errors` array
 *
 * Neither shape carries the reason at the top level — it is per-log, so a frame
 * is the only place it can travel. Anything Bun throws that is neither shape
 * (a plugin's own throw, for one) passes through to `toPayload`'s UNEXPECTED.
 *
 * @param {Bun.BuildConfig} config
 */
export async function safeBunBuild(config) {
  try {
    const result = await Bun.build(config);

    if (!result.success) {
      throw new CastroError("BUNDLE_FAILED", undefined, toFrames(result.logs));
    }

    return result;
  } catch (error) {
    if (error instanceof AggregateError) {
      // AggregateError.message is Bun's constant summary ("Bundle failed"),
      // which the BUNDLE_FAILED title already says. The reason a user needs
      // lives on each entry and rides along on its frame.
      throw new CastroError("BUNDLE_FAILED", undefined, toFrames(error.errors));
    }

    throw error;
  }
}

/**
 * Warnings share the log array with errors on a failed build; they describe
 * something the build survived, so rendering them as failure locations points
 * at the wrong line.
 *
 * @param {(BuildMessage | ResolveMessage)[]} logs
 * @returns {CodeFrame[]}
 */
function toFrames(logs) {
  return logs.filter((log) => log.level === "error").map(bunLogToFrame);
}

/**
 * Converts a Bun.build log/error entry into a CodeFrame.
 * @param {BuildMessage | ResolveMessage} log
 * @returns {CodeFrame}
 */
function bunLogToFrame(log) {
  const position = log.position;
  // Some Bun resolve failures (e.g. the synthetic virtual entry fed to the
  // bundler by compileIslandClient) report line/column as -1 instead of
  // omitting position entirely. A non-positive line means "no real position"
  // — and since renderError.js anchors everything to the line, dropping the
  // column and lineText with it beats printing "file:-1:0".
  const hasPosition = !!position && position.line > 0;

  return {
    // The one string that says why the build failed — "Could not resolve:
    // …", "Syntax Error". Bun keeps it here, never on the AggregateError.
    message: log.message,
    file: position?.file,
    line: hasPosition ? position.line : undefined,
    // Bun/esbuild columns are 0-based; normalize to 1-based here so the
    // displayed location, the vscode:// link, and both caret renderers all
    // share the editor convention. Renderers subtract 1 for the 0-based offset.
    column: hasPosition ? position.column + 1 : undefined,
    lineText: hasPosition ? position.lineText : undefined,
  };
}
