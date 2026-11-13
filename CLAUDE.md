# Project instructions

## Strict equality

Use `===` / `!==`. Loose `==` / `!=` is allowed only when comparing a variable against `null` or `undefined` and the variable's type includes both `null` and `undefined`.

## Reviewing code changes

After making code changes, open the diff pane in the Claude app (`show_pane` with `pane: "diff"`) so the user can review them. Use the commit SHA as the scope after committing, or `uncommitted` before committing. The user reviews changes here rather than in SourceTree, which does not show Claude's changes.
