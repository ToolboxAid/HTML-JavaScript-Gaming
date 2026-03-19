PR-013 — engine/game documentation posture split apply

### Status

This APPLY_PR installs the docs-only documentation-posture split patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the documentation-posture split docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only documentation-posture split for compatibility-retained `engine/game` exports
- preserve the documented PR-012 transition-planning baseline
- record supported compatibility surfaces versus transition-planning-note surfaces without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
