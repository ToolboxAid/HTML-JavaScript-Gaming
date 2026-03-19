PR-015 — engine/game documentation template snippets apply

### Status

This APPLY_PR installs the docs-only documentation template snippet patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the documentation template snippet docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only reusable snippet templates for compatibility-retained `engine/game` exports
- preserve the documented PR-013 and PR-014 posture and wording baselines
- record template snippets, placeholders, and usage rules without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
