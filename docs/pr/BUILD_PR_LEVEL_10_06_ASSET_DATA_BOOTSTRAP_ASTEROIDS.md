# BUILD_PR — LEVEL 10_06 — ASSET DATA BOOTSTRAP (ASTEROIDS)

## Objective
Bootstrap real tool-editable data objects for Asteroids assets so the new `data/` folders stop being placeholders and begin serving as actual editor/project surfaces.

## Scope
- add initial tool-editable JSON objects under:
  - `games/Asteroids/assets/sprites/data/`
  - `games/Asteroids/assets/tilemaps/data/`
  - `games/Asteroids/assets/parallax/data/`
  - `games/Asteroids/assets/vectors/data/`
- align bootstrap data with the current runtime assets where practical
- keep runtime assets untouched
- prepare the repo for the next lane where project/manifests can point to real editable data

## Out of Scope
- no engine changes
- no runtime asset moves/deletes
- no gameplay changes
- no tool UI changes
- no broad multi-game rollout yet

## Bootstrap Direction
The bootstrap objects should be minimal but real:
- valid JSON
- named to match actual Asteroids asset intent
- structured so tools can evolve them later
- clearly tool/editor-facing, not runtime-facing

Where practical:
- vector data objects should reflect current vector asset identities
- parallax data objects should reflect current parallax asset identities
- sprite/tilemap data objects should provide a starter project surface even if runtime assets remain primary for now

## Roadmap Instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change roadmap prose except for previously approved additions already in flight.

## What to Execute
PowerShell:
scripts/PS/validate/Validate-All.ps1 -ValidateAssetStructure

Then manually verify:
- the four Asteroids `data/` folders contain real JSON files, not only `.gitkeep`
- names are aligned with Asteroids asset intent

## Expected
- validation remains PASS
- real bootstrap JSON files exist in all four Asteroids asset data folders

## Acceptance Criteria
- all four Asteroids asset `data/` folders contain at least one real JSON bootstrap file
- runtime assets remain untouched
- validation still passes
- roadmap receives status-only updates where applicable
