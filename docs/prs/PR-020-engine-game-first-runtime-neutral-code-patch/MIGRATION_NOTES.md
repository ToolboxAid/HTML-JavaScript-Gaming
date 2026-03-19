PR-020 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should be the actual first non-docs patch, constrained to:
- comment-only insertions
- the six documented `engine/game` export files
- wording aligned to the documented compatibility posture
- zero behavior, import, rename, or file-location change

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no export removal in the first code patch
- keep the first code patch reversible and easy to audit against this spec
