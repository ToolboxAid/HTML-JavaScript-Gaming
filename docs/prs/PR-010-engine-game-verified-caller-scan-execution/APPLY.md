PR-010 — engine/game verified caller scan execution apply

### Status

This APPLY_PR installs the docs-only verified caller scan package for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the verified caller scan docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the verified caller scan results package for the compatibility-retained `engine/game` exports
- record verified caller files, caller categories, and reference types
- preserve compatibility and keep the patch docs-only
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
