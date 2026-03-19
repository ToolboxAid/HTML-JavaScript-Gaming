PR-017 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should define a refactor-readiness guardrail PR that translates the completed docs work into first-code-PR boundaries, such as:
- what early code PRs may annotate or align
- what exports must remain untouched initially
- what changes are explicitly off-limits until later stages

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no export removal in this PR
- keep future code refactoring aligned to the documented compatibility posture and usage evidence
