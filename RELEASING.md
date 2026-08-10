# Releasing

Two independently-versioned npm packages live here: `core/` (`@vktrz/castro`)
and `packages/create-castro/` (`create-castro`). Same recipe for both — run
`bun verify` from the repo root (it's a root script), everything else from
the package's own directory.

```sh
# Run all checks. This is a root script — bun doesn't walk up to the repo
# root's scripts from a workspace subdirectory, so run it from there.
bun verify

# Bumps "version" in package.json and prints it, e.g. "v0.2.0" (drop the
# leading "v" for the tag below). Run from core/ or packages/create-castro/.
#
# --no-git-tag-version skips bun's built-in commit+tag step, which we do
# manually below anyway: it only fires when run from the git root, and
# neither package is the git root, so from a workspace subdirectory it's
# silently a no-op regardless of this flag — passing it just makes that
# explicit, and keeps the recipe correct if bun's workspace behavior changes.
#
# Other bump types: major | minor | patch | premajor | preminor | prepatch |
# prerelease. You can also pass an explicit version instead, e.g.
# `bun pm version 0.2.0 --no-git-tag-version`.
bun pm version minor --no-git-tag-version

# Commit and tag with the version just printed, e.g. "v0.2.0". Works from
# the package directory — no need to cd to the repo root.
#
# Tag is scoped by package name (name@version), not bare vX.Y.Z: the two
# packages release independently, and a bare version would collide or be
# ambiguous about which one moved.
#
# Tag must be annotated (-a/-m): git push --follow-tags only pushes
# annotated tags, so a lightweight `git tag` here would silently never
# reach the remote.
git add package.json
git commit -m "v0.2.0"
git tag -a "v0.2.0" -m "v0.2.0"

# Publishes to npm. Run in a real terminal — the registry requires an OTP
# (or pass --otp=<code> to bun publish if you have one already).
#
# @vktrz/castro publishes public via its package.json `publishConfig.access`
# (scoped packages default private otherwise). create-castro is unscoped, so
# it's already public regardless.
npm login
bun publish

# Pushes the commit and the tag created above.
git push --follow-tags
```
