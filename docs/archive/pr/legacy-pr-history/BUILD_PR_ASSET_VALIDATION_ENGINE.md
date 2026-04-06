# BUILD_PR_ASSET_VALIDATION_ENGINE

## Goal
Implement the enforced project-level asset validation engine defined in `PLAN_PR_ASSET_VALIDATION_ENGINE` without expanding scope or changing engine core APIs.

## Implemented Scope
- Added shared validation engine in `tools/shared/projectAssetValidation.js`
  - deterministic stable result structure:
    - `validation.status`
    - ordered `validation.findings[]`
    - stable finding fields: `code`, `severity`, `blocking`, `sourceType`, `sourceId`, `message`
  - registry-first validation over deterministic graph rebuilds
  - duplicate registry ID detection
  - invalid dependency target detection
  - orphaned graph-node warnings
  - circular dependency detection
  - stale graph snapshot detection against registry source data
  - tool-specific dependency checks for sprite, tilemap, and parallax consumers
- Added automated coverage in `tests/tools/AssetValidationEngine.test.mjs`
  - valid project passes
  - invalid palette dependency blocks
  - duplicate IDs block
  - stale graph snapshots remain non-blocking warnings
  - repeated validation remains deterministic
  - legacy-style documents without required registry refs remain loadable
- Integrated enforced validation into guarded editor operations only:
  - `tools/Sprite Editor/modules/spriteEditorApp.js`
    - blocks guarded PNG/sprite-sheet export and save flows when blocking findings exist
    - surfaces validation summaries on load/save
  - `tools/Tilemap Studio/main.js`
    - blocks guarded project save, registry save, and runtime export when blocking findings exist
    - surfaces validation summaries on load/save
  - `tools/Parallax Scene Studio/main.js`
    - blocks guarded project save, registry save, and patch export when blocking findings exist
    - surfaces validation summaries on load/save
- Preserved legacy remediation behavior
  - legacy loads still succeed
  - invalid content can still be opened, inspected, edited, and revalidated
  - enforcement is limited to guarded save/export/package-style actions

## Manual Validation Checklist
1. Valid project can save guarded state successfully. `PASS`
2. Invalid project with missing asset ID cannot perform guarded save/finalize. `PASS`
3. Duplicate IDs produce blocking findings. `PASS`
4. Illegal cycles produce blocking findings. `PASS`
5. Warnings remain non-blocking. `PASS`
6. Legacy invalid project can still load and be repaired. `PASS`
7. Findings are deterministic across repeated validation. `PASS`
8. Engine core APIs remain unchanged. `PASS`

## Validation Summary
- Syntax checks passed:
  - `node --check tools/shared/projectAssetValidation.js`
  - `node --check tools/Sprite Editor/modules/spriteEditorApp.js`
  - `node --check tools/Tilemap Studio/main.js`
  - `node --check tools/Parallax Scene Studio/main.js`
  - `node --check tests/tools/AssetValidationEngine.test.mjs`
- Targeted validation-engine test passed:
  - `node` inline runner for `tests/tools/AssetValidationEngine.test.mjs`
- Full Node test suite passed:
  - `node ./scripts/run-node-tests.mjs`

## Scope Guard
- Registry remains the source of truth.
- Dependency graph remains additive and validation-driven.
- Enforcement is limited to guarded save/export/package paths.
- No engine core API files were modified.

## Approved Commit Comment
build(asset-validation): add enforced project asset validation engine

## Next Command
APPLY_PR_ASSET_VALIDATION_ENGINE
