PR-004 — engine/game concrete export inventory apply

### Status

This APPLY_PR installs the docs-only concrete export inventory patch for `engine/game`.

### Scope

This apply package records the inventory documentation under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- record the actual `engine/game` export inventory structure
- keep inventory work factual and docs-only
- avoid code edits, import rewrites, file moves, or deletions
- preserve current execution paths

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
