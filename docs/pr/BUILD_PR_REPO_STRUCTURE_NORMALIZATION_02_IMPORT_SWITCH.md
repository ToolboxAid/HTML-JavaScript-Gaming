# BUILD PR — Repo Structure Normalization (02) Import Switch

## Scope
Update imports from `engine/` → `src/engine/`

## Constraints
- DO NOT scan repo
- ONLY modify files that contain engine imports
- NO engine API changes
- NO new files

## Targets
- Replace import paths referencing `engine/` with `src/engine/`

## Validation
- App runs using src/engine paths only
