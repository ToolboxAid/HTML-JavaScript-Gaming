PR-006 — engine/game repo export scan execution apply

### Status

This APPLY_PR installs the docs-only blocked-status package for `engine/game` repo export scan execution.

### Scope

This apply package records the blocked execution state under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the blocked-status docs package for the factual export scan step
- clearly record that actual scan results were not verified in this environment
- preserve workflow continuity without inventing repo facts
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no unverified export results
