PR-018 — migration notes

### Current State

This PR is docs-only and compatibility-preserving.

### Recommended Next Direction

The next surgical step should be the first non-docs refactor PR, constrained to a runtime-neutral alignment change such as:
- intent comments near exports
- runtime-neutral posture markers
- preferred-path guidance comments

### Guardrails

- no runtime behavior changes without approval
- no destructive changes
- no export removal in the first code PR
- keep the first code PR reversible, narrow, and easy to audit against these guardrails
