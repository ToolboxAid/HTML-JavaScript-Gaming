PR-016 — engine/game concrete documentation block examples apply

### Status

This APPLY_PR installs the docs-only concrete documentation block examples patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the concrete documentation block example docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only concrete documentation block examples for compatibility-retained `engine/game` exports
- preserve the documented PR-013, PR-014, and PR-015 posture and wording baselines
- record example blocks, ordering guidance, and usage notes without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
