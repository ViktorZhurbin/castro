# Releasing

```sh
# Run all checks
bun verify

cd <package-dir>

# Bumps "version" in package.json, commits, and tags the commit — all in
# one step, because pnpm creates the tag itself (unlike `bun pm version`,
# which only auto-commits/tags from the exact git root).
#
# --tag-version-prefix is required: without it pnpm tags bare "vX.Y.Z",
# which the two packages can collide on since they release independently
# --message keeps the commit text matching the tag.
#
# Other bump types: major | minor | patch | premajor | preminor | prepatch | prerelease.
# You can also pass an explicit version instead.
pnpm version minor # for core/
# OR
pnpm version minor --tag-version-prefix "create-castro@" --message "create-castro@%s"

# Run in a real terminal
pnpm login
pnpm publish

# Pushes the commit and the tag created above.
git push --follow-tags
```
