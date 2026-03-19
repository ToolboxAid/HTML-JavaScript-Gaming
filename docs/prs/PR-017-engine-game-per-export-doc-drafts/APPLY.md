PR-017 — engine/game per-export documentation drafts apply

### Status

This APPLY_PR installs the docs-only per-export documentation draft patch for the compatibility-retained
`engine/game` exports.

### Scope

This apply package records the per-export documentation draft docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only per-export documentation drafts for compatibility-retained `engine/game` exports
- preserve the documented PR-013 through PR-016 posture, wording, template, and example baselines
- record export-specific draft blocks and usage notes without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
