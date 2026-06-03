# PR 11.75 Utils Consolidation Report

## Scope Executed
- Consolidated shared-safe engine math utilities into shared utils.
- Updated imports to canonical shared path.
- Removed duplicate engine utility source only after import updates.
- No wrappers, alias files, bridge exports, pass-through variables, or broad refactors introduced.

## Inventory (File + Exported Method)
- Engine utils files: 5
- Shared utils files: 18
- Inventory CSV: `docs_build/dev/reports/PR_11_75_utils_inventory.csv`

## Consolidation Decisions
- Moved shared-safe utility implementation:
  - `clamp`, `distance`, `wrap`, `randomRange`
  - From deleted file: `src/shared/utils/math.js`
  - To canonical file: `src/shared/utils/mathUtils.js`
- Kept engine-bound utilities in `src/engine/utils`:
  - `fuzzyMatchScore.js`
  - `geometry.js`
  - `invariant.js`
  - `normalizeCommandText.js`
- Updated barrel export: `src/shared/utils/index.js` now exports shared math utils.
- Updated engine barrel: removed math exports from `src/shared/utils/index.js`.

## Import Update Coverage
- JS/MJS files updated in this PR: 62
- In-scope source/sample/game/test files touched: 62
- Canonical import path now used: `src/shared/utils/mathUtils.js`

## Targeted Validation
1. Syntax checks: `node --check` run for all changed JS/MJS files (excluding deleted files)
   - Result: PASS (`node_check_passed=61`)
2. Legacy path check for removed engine math utility path
   - Check: repository scan for `src/shared/utils/math.js` in JS/MJS imports
   - Result: PASS (`legacy_engine_math_path_refs=0`)
3. Targeted import-resolution scan on changed JS/MJS files
   - Result: PASS for consolidation changes; one pre-existing unrelated unresolved import remains:
   - `samples/phase-13/1316/game/FakeLoopbackNetworkModel.js -> ../../shared/latencyModel.js`
   - This path issue was present outside the utils-consolidation scope and was not modified in this PR.
4. Full sample suite
   - Skipped by instruction (targeted syntax/import validation only).

## Changed Files (Core)
- `src/shared/utils/mathUtils.js` (new)
- `src/shared/utils/index.js`
- `src/shared/utils/index.js`
- `src/shared/utils/math.js` (deleted)
- Multiple import-only path updates across `src/`, `games/`, `samples/`, and `tests/`.
