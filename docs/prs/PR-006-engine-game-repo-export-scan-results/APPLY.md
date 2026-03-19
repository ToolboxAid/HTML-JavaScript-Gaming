PR-006 — engine/game repo export scan results apply

### Status

This APPLY_PR installs the verified docs-only export scan results for `engine/game`.

### Scope

This apply package records the verified export scan results under `/docs/prs`
and preserves compatibility with no runtime behavior changes.

### Applied Intent

- apply the verified `engine/game` export scan results
- record exact export names as exposed by the scanned entry files
- record defining files and re-export files where applicable
- record direct export versus re-export status
- preserve compatibility with no code-path changes

### Non-Goals

- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
