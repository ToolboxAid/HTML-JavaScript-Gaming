PR-012 — engine/game transition-planning candidates apply

### Status

This APPLY_PR installs the docs-only transition-planning candidate patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the transition-planning candidate docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only split between actively supported compatibility surfaces and transition-planning candidates
- preserve the documented PR-011 usage-risk baseline
- record planning posture without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
