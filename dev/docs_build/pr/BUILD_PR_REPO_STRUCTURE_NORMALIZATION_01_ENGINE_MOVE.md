# BUILD PR — Repo Structure Normalization (01) Engine Move (Staged, Non-Destructive)

## Scope
Create `src/src/engine/` and copy the contents of the existing `src/engine/` directory into it.
DO NOT delete or modify the original `src/engine/` directory in this PR.

## Rationale
- Establish target structure without breaking existing imports
- Allow parallel validation before any cutover

## Constraints
- DO NOT scan repo
- ONLY modify listed targets
- NO engine API changes
- NO new files unless explicitly listed (only files created under `src/src/engine/**` that mirror `src/engine/**`)
- Do NOT change any import paths in this PR

## Targets
- Create directory: `src/src/engine/`
- Copy: `src/engine/**` → `src/src/engine/**` (1:1 mirror)

## Non-Goals
- No deletions
- No refactors
- No import updates
- No behavior changes

## Validation
- Project still runs using existing `src/engine/` paths
- `src/src/engine/` contains a complete mirror of `src/engine/`
