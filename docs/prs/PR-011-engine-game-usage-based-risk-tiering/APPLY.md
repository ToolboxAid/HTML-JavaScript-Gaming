PR-011 — engine/game usage-based risk tiering apply

### Status

This APPLY_PR installs the docs-only usage-based risk-tiering patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the verified usage-based risk tiers under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only risk tiers for the compatibility-retained `engine/game` exports
- preserve the verified PR-010 caller-evidence baseline
- record high, medium, and low risk intent without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
