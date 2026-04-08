# BUILD_PR_SHARED_EXTRACTION_04_AS_FINITE_NUMBER_ONLY

## Purpose
Extract and normalize `asFiniteNumber` only.

This BUILD intentionally narrows scope to one executable helper move so the bundle can execute code directly without guessing.

## Single PR Purpose
- move duplicate `asFiniteNumber` implementations into the existing shared number helper module
- update only the exact imports/call sites affected by that move

## Exact Source Files
1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`
3. `games/network_sample_c/game/ReconciliationLayerAdapter.js`

## Exact Destination File
- `src/shared/utils/numberUtils.js`

## Exact Move Rules
### Destination ownership
`src/shared/utils/numberUtils.js` must export:
- `asFiniteNumber`
- preserve existing exports already in that file
- do not rename `asFiniteNumber`

### Source edits
#### 1) `src/advanced/promotion/createPromotionGate.js`
- remove the local `asFiniteNumber` function definition
- keep the local `asPositiveInteger` function as-is
- add an import for `asFiniteNumber` from:
  - `../../shared/utils/numberUtils.js`

#### 2) `src/advanced/state/createWorldGameStateSystem.js`
- remove the local `asFiniteNumber` function definition
- keep the local `asPositiveInteger` function as-is
- add an import for `asFiniteNumber` from:
  - `../../shared/utils/numberUtils.js`

#### 3) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- remove the local `asFiniteNumber` function definition
- add an import for `asFiniteNumber` from:
  - `../../../src/shared/utils/numberUtils.js`

## Hard Constraints
- edit only the 4 files listed in this BUILD:
  - `src/shared/utils/numberUtils.js`
  - `src/advanced/promotion/createPromotionGate.js`
  - `src/advanced/state/createWorldGameStateSystem.js`
  - `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- do not change logic
- do not move any other helper
- do not modify engine APIs
- do not normalize `getState` in this PR
- do not touch `asPositiveInteger` in this PR except preserving existing local usage in the two advanced files
- do not perform repo-wide cleanup

## Validation Checklist
1. Confirm only the 4 listed files changed
2. Confirm `asFiniteNumber` is exported from `src/shared/utils/numberUtils.js`
3. Confirm `asFiniteNumber` local definitions no longer exist in:
   - `src/advanced/promotion/createPromotionGate.js`
   - `src/advanced/state/createWorldGameStateSystem.js`
   - `games/network_sample_c/game/ReconciliationLayerAdapter.js`
4. Confirm imports now point to:
   - `../../shared/utils/numberUtils.js`
   - `../../../src/shared/utils/numberUtils.js`
5. Confirm no logic/runtime behavior changes were introduced
6. Confirm no `getState` work was performed

## Non-Goals
- no `getState` extraction
- no import normalization beyond `asFiniteNumber`
- no alias path migration
- no refactor
- no file creation beyond using the existing `src/shared/utils/numberUtils.js`
