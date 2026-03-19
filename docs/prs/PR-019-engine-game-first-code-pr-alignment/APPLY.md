PR-019 — engine/game first code PR alignment apply

### Status

This APPLY_PR installs the docs-only first-code-PR alignment patch for `engine/game`.

### Scope

This apply package records the first runtime-neutral alignment PR docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only first-code-PR alignment plan for `engine/game`
- preserve the documented PR-018 refactor-readiness guardrails
- record the single-purpose runtime-neutral first code PR shape, file scope, allowed changes, and review criteria without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
