# LEVEL_11_1_IMPLEMENTATION_NOTES_FOR_CODEX

## Implementation Shape
Codex should make a minimal, surgical implementation delta that:
- promotes exactly one named transition to authoritative ownership
- keeps all other transitions passive or stubbed
- adds only targeted tests and feature gate wiring
- keeps files local to the advanced state layer and closely related tests

## Expected Focus Areas
- src/advanced/state/
- tests/ relevant to the advanced state candidate
- docs/dev artifacts only if refreshed as part of the PR handoff

## Avoid
- new engine extension points
- broad refactors
- second consumer paths
- new sample dependencies
- migration of unrelated objective systems
