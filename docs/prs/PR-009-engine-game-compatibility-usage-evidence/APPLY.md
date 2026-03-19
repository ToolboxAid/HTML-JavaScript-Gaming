PR-009 — engine/game compatibility usage evidence apply

### Status

This APPLY_PR installs the docs-only compatibility usage-evidence patch for the verified
compatibility-retained `engine/game` exports.

### Scope

This apply package records the usage-evidence docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only usage-evidence framework for compatibility-retained `engine/game` exports
- preserve the verified PR-008 compatibility-retained baseline
- record caller-search rules and evidence-matrix structure without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
