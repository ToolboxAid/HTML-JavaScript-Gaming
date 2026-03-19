PR-007 — engine/game export classification from verified results apply

### Status

This APPLY_PR installs the docs-only classification patch for the verified `engine/game` exports.

### Scope

This apply package records the verified export classifications under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only classification for the 8 verified `engine/game` exports
- preserve the verified PR-006 export baseline
- record public, internal, and transitional intent without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
