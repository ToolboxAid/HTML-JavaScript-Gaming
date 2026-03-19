PR-003 — engine/game classification rules

### Public Rule

Mark an export public when it supports game composition or orchestration, aligns with
`GameBase`, and does not expose runtime-only plumbing.

### Internal Rule

Mark an export internal when it coordinates runtime details, leaks implementation detail,
or exists primarily for setup or hidden pass-through behavior.

### Transitional Rule

Mark an export transitional when it exists mainly for compatibility and bridges older
callers to the newer boundary model.

### Safety Rule

This PR is docs-only. Classification here must not change runtime behavior.
