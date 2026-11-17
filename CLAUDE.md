# Project instructions

## Strict equality

Use `===` / `!==`. Loose `==` / `!=` is allowed only when comparing a variable against `null` or `undefined` and the variable's type includes both `null` and `undefined`.

## Reviewing code changes

After making code changes, let the user review them:

- If the `show_pane` tool is available (Claude desktop app), call it with `pane: "diff"`. Use the commit SHA as the scope after committing, or `uncommitted` before committing.
- If it isn't available (for example in a devcontainer), say so and show `git diff` (uncommitted) or `git show <sha>` (after committing) instead.
