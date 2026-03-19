PR-005 — engine/game factual export capture apply

### Status

This APPLY_PR installs the docs-only factual export capture patch for `engine/game`.

### Scope

This apply package records the factual export capture documentation under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- record the actual `engine/game` export capture structure
- keep capture work factual and docs-only
- avoid code edits, import rewrites, file moves, or deletions
- preserve current execution paths

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
