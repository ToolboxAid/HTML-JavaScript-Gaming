# BUILD PR — Repo Structure Normalization (03) Remove Legacy `src/engine/` Directory

## Scope
Remove the old root-level `src/engine/` directory now that:
- `src/src/engine/` exists as a verified 1:1 mirror
- imports have been switched to `src/src/engine/...`
- no legacy `src/engine/...` import/export/require statements remain

## Constraints
- DO NOT scan repo broadly
- ONLY verify and remove the root-level `src/engine/` directory
- NO engine API changes
- NO new source files
- NO import changes in this PR

## Targets
- Remove directory: `src/engine/`

## Non-Goals
- No refactors
- No logic edits
- No changes under `src/src/engine/`
- No changes to docs beyond this PR bundle

## Validation
- `src/engine/` no longer exists
- `src/src/engine/` remains intact
- app/runtime still resolves engine imports through `src/src/engine/...`
