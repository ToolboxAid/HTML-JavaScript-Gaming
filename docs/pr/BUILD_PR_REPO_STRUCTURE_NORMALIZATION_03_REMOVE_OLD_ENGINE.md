# BUILD PR — Repo Structure Normalization (03) Remove Legacy `engine/` Directory

## Scope
Remove the old root-level `engine/` directory now that:
- `src/engine/` exists as a verified 1:1 mirror
- imports have been switched to `src/engine/...`
- no legacy `engine/...` import/export/require statements remain

## Constraints
- DO NOT scan repo broadly
- ONLY verify and remove the root-level `engine/` directory
- NO engine API changes
- NO new source files
- NO import changes in this PR

## Targets
- Remove directory: `engine/`

## Non-Goals
- No refactors
- No logic edits
- No changes under `src/engine/`
- No changes to docs beyond this PR bundle

## Validation
- `engine/` no longer exists
- `src/engine/` remains intact
- app/runtime still resolves engine imports through `src/engine/...`
