PR-011 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should split high-risk and medium-risk compatibility-retained exports into:
- actively supported compatibility surfaces
- transition-planning candidates
- documentation de-emphasis candidates

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no export removal in this PR
- keep future narrowing evidence-based, small, and reversible where possible
