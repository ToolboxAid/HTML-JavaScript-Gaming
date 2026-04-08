# BUILD_PR_SHARED_EXTRACTION_05_GETSTATE_PROMOTION_STATE_ONLY

## Purpose
Extract the duplicated promotion-state `getState` snapshot construction into one shared helper, without touching broader `getState` usages.

## Single PR Purpose
Centralize the duplicated promotion-state snapshot logic currently embedded inside:
- `src/advanced/promotion/createPromotionGate.js`
- `src/advanced/state/createWorldGameStateSystem.js`

This BUILD does **not** attempt repo-wide `getState` normalization.

## Exact Files Allowed
Edit only these 3 files:

1. `src/shared/state/createPromotionStateSnapshot.js` **(new file)**
2. `src/advanced/promotion/createPromotionGate.js`
3. `src/advanced/state/createWorldGameStateSystem.js`

Do not edit any other file.

## Exact New File
Create:

`src/shared/state/createPromotionStateSnapshot.js`

### Required export
Export exactly one named function:

```js
export function createPromotionStateSnapshot({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation
}) {
  return {
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation: typeof cloneLastEvaluation === 'function'
      ? cloneLastEvaluation(lastEvaluation)
      : lastEvaluation ?? null
  };
}
```

## Exact Source Changes

### 1) `src/advanced/promotion/createPromotionGate.js`
Add import:

```js
import { createPromotionStateSnapshot } from '../shared/state/createPromotionStateSnapshot.js';
```

Replace the current local `getState()` body so it returns:

```js
return createPromotionStateSnapshot({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation: (value) => (value ? { ...value } : null)
});
```

Do not change the function name `getState`.
Do not change `getMetrics`.
Do not change evaluation logic.

### 2) `src/advanced/state/createWorldGameStateSystem.js`
Add import:

```js
import { createPromotionStateSnapshot } from '../../shared/state/createPromotionStateSnapshot.js';
```

Replace the current local `getState()` body so it returns:

```js
return createPromotionStateSnapshot({
  promoted,
  stableFrames,
  stabilityWindowFrames: windowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation: (value) => (value ? cloneDeep(value) : null)
});
```

Do not change the function name `getState`.
Do not change `getMetrics`.
Do not change transition/evaluation logic.

## Hard Constraints
- no repo scan
- no broader `getState` cleanup
- no engine API changes
- no renaming of existing `getState` functions
- no helper extraction beyond this promotion-state snapshot helper
- no additional files
- no import normalization outside the 2 exact source files above
- preserve existing behavior:
  - `createPromotionGate.js` keeps shallow-copy behavior for `lastEvaluation`
  - `createWorldGameStateSystem.js` keeps `cloneDeep` behavior for `lastEvaluation`
  - `createWorldGameStateSystem.js` keeps `stabilityWindowFrames: windowFrames`

## Validation Checklist
1. Confirm only the 3 listed files changed
2. Confirm `src/shared/state/createPromotionStateSnapshot.js` exists and exports only `createPromotionStateSnapshot`
3. Confirm `getState()` still exists in:
   - `src/advanced/promotion/createPromotionGate.js`
   - `src/advanced/state/createWorldGameStateSystem.js`
4. Confirm both `getState()` functions now delegate to `createPromotionStateSnapshot(...)`
5. Confirm behavior is preserved:
   - promotion gate uses shallow copy for `lastEvaluation`
   - world game state system uses `cloneDeep` for `lastEvaluation`
   - world game state system still uses `windowFrames` as `stabilityWindowFrames`
6. Confirm no other `getState` call sites or implementations were touched

## Non-Goals
- no repo-wide `getState` standardization
- no work in `samples/shared/worldGameStateSystem.js`
- no work in consumers, integration files, or engine state APIs
- no alias-path migration
- no refactor beyond this exact extraction
