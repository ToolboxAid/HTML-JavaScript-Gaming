PR-019 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should be the first non-docs alignment PR itself, constrained to:
- runtime-neutral comments or markers only
- the smallest practical set of `engine/game` export files
- no behavior, import, or file-structure changes

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no export removal in the first code PR
- keep the first code PR easy to review, reverse, and compare against the documented guardrails
