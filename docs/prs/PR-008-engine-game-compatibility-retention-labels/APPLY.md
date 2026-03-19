PR-008 — engine/game compatibility retention labels apply

### Status

This APPLY_PR installs the docs-only retention-label patch for the verified `engine/game` exports.

### Scope

This apply package records the verified retention labels under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only retention labels for the verified `engine/game` exports
- preserve the verified PR-007 classification baseline
- record intended public-facing versus compatibility-retained intent without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
