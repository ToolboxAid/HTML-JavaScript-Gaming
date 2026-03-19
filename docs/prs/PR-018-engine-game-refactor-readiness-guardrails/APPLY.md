PR-018 — engine/game refactor readiness guardrails apply

### Status

This APPLY_PR installs the docs-only refactor-readiness guardrails patch for the first non-docs
`engine/game` refactor PR.

### Scope

This apply package records the first-code-PR guardrail docs under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the docs-only guardrails for the first `engine/game` code PR
- preserve the completed architecture, compatibility, risk, wording, and per-export documentation groundwork
- record allowed changes, forbidden changes, compatibility invariants, and review rules without changing code paths
- avoid code edits, import rewrites, file moves, or deletions

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no export removal or renaming
