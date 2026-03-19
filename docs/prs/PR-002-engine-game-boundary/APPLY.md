PR-002 — Apply engine/game architecture boundary docs

### Purpose
Apply the docs-only boundary patch for `engine/game`.

### Outcome
This PR applies architecture documentation that defines `engine/game` as the game-facing orchestration layer while preserving `engine/core` as the runtime layer.

### Applied Scope
- `/docs/prs/PR-002-engine-game-boundary/BOUNDARY.md`
- `/docs/prs/PR-002-engine-game-boundary/EXPORT_CLASSIFICATION.md`
- `/docs/prs/PR-002-engine-game-boundary/DEPENDENCY_RULES.md`
- `/docs/prs/PR-002-engine-game-boundary/MIGRATION_NOTES.md`
- `/docs/prs/PR-002-engine-game-boundary/APPLY.md`

### Non-Goals
- no runtime behavior changes
- no file movement
- no import rewrites
- no deletions
- no sample/game rewiring

### Applied Boundary
#### Public
Game-facing APIs that game code may import directly.

Current public direction:
- `GameBase` is the preferred public entry point
- stable game orchestration contracts may be exposed here
- public surfaces must not expose runtime-only implementation details

#### Internal
Runtime-only plumbing not meant for direct game imports.

Current internal direction:
- setup and binding helpers
- runtime coordination details
- internal pass-through plumbing
- hidden orchestration helpers

#### Transitional
Compatibility surfaces that bridge old structure to new structure.

Current transitional direction:
- wrappers
- shims
- legacy re-exports
- bridge modules required by current callers

### Review Checklist
- docs live under `/docs/prs`
- one PR, one purpose
- docs-first only
- no runtime behavior change
- compatibility preserved
- boundary language aligns to GameBase-centered architecture
