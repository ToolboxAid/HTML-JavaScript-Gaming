PR-003 — engine/game export classification apply

### Status

This APPLY_PR installs the docs-only export classification patch for `engine/game`.

### Scope

This apply package records the export classification documentation under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- keep `GameBase` as the preferred public entry point
- classify `engine/game` exports as public, internal, or transitional
- avoid any code edits, import rewrites, file moves, or deletions
- preserve current execution paths

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
