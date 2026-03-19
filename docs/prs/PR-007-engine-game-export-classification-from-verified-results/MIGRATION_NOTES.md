PR-007 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should document which currently exposed internal and transitional exports are:
- intentionally public for now
- compatibility-preserved only
- candidates for future narrowing in later approved PRs

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no direct export removal in this PR
- keep future narrowing small and evidence-based
