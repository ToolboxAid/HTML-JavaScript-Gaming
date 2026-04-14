# BUILD_PR — LEVEL 10_05 — ASSET STRUCTURE MIGRATION (ASTEROIDS)

## Objective
Migrate existing Asteroids game assets into the tool-editable structure required by validation.

## Scope
- add missing `data/` folders under:
  - sprites
  - tilemaps
  - parallax
  - vectors
- ensure structure:
  assets/<domain>/data/*.json
- do not remove existing runtime assets
- prepare assets for tool editing

## What to Execute
PowerShell:
scripts/PS/validate/Validate-All.ps1 -ValidateAssetStructure

## Expected
- BEFORE: FAIL (missing data folders)
- AFTER: PASS

## Acceptance Criteria
- all required data folders exist
- validator passes with -ValidateAssetStructure
- no runtime assets broken
