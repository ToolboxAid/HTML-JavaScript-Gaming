PR-014 — engine/game wording treatment rules apply

### Status

This APPLY_PR installs the docs-only wording-treatment rules patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the wording-treatment rules docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only wording-treatment rules for compatibility-retained `engine/game` exports
- preserve the documented PR-013 documentation-posture baseline
- record wording rules, preferred language, and avoided language without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
