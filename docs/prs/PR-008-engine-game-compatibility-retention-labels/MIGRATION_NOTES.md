PR-008 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should identify which compatibility-retained exports are:
- explicitly temporary
- candidates for later de-emphasis in documentation
- still required by samples, games, or external callers

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no direct export removal in this PR
- keep future boundary narrowing small and evidence-based
