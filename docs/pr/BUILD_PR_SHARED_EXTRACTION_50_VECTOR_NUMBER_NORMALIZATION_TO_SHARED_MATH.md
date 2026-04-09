# BUILD PR — VECTOR NUMBER NORMALIZATION TO SHARED MATH

## PR Purpose
Move the numeric normalization helpers introduced in PR 49 out of the vector-domain file and into the canonical shared math home.

## Why This BUILD Exists
PR 49 introduced:
- `toFiniteNumber(value, fallback = NaN)`
- `roundNumber(value)`

inside:
- `tools/shared/vector/vectorGeometryMath.js`

Per current repo rule, number-related helpers belong under:
- `src/shared/math/numberNormalization.js`

This BUILD performs only that extraction for the exact PR 49 vector lane.

## Exact Target Files
Create:
- `src/shared/math/numberNormalization.js`

Modify:
- `tools/shared/vector/vectorGeometryMath.js`
- `tools/shared/vector/vectorAssetContract.js`

## Exact Required Changes

### 1) Create shared math module
Create:
- `src/shared/math/numberNormalization.js`

Export exactly:
- `toFiniteNumber(value, fallback = NaN)`
- `roundNumber(value)`

Behavior must match PR 49 exactly:
- `toFiniteNumber`:
  - converts with `Number(value)`
  - returns numeric value when finite
  - otherwise returns `fallback`
- `roundNumber`:
  - returns input unchanged when not finite
  - otherwise returns `Number(value.toFixed(6))`

Do not add any other helpers in this PR.

### 2) Update vectorGeometryMath.js
In:
- `tools/shared/vector/vectorGeometryMath.js`

Remove the local implementations of:
- `toFiniteNumber`
- `roundNumber`

Import those helpers from:
- `../../../src/shared/math/numberNormalization.js`

Keep all existing vector geometry exports and behavior unchanged otherwise.

### 3) Update vectorAssetContract.js
In:
- `tools/shared/vector/vectorAssetContract.js`

Stop importing `toFiniteNumber` and `roundNumber` from `./vectorGeometryMath.js`.

Import:
- `parseSvgPathData` from `./vectorGeometryMath.js`
- `toFiniteNumber` and `roundNumber` from `../../../src/shared/math/numberNormalization.js`

No other logic changes.

## Non-Goals
- Do not touch any files outside the three exact target files above.
- Do not scan the repo for other number helpers.
- Do not merge with `asFiniteNumber`, `normalizeNumber`, `sanitizeFiniteNumber`, or any other helper.
- Do not touch `samples/shared/worldGameStateSystem.js`.
- Do not touch `src/advanced/state/transitions.js`.
- Do not change fallback defaults.
- Do not rename exports.
- Do not perform broader cleanup.

## Acceptance Criteria
- `src/shared/math/numberNormalization.js` exists and exports only the two exact functions above.
- `tools/shared/vector/vectorGeometryMath.js` no longer defines local `toFiniteNumber` or `roundNumber`.
- `tools/shared/vector/vectorAssetContract.js` imports numeric helpers from shared math, not vectorGeometryMath.
- Runtime behavior of the vector lane remains unchanged.
- No dead imports.
- No unused local helper definitions remain in the touched files.

## Validation
- Verify the three exact target files are the only code files changed.
- Verify import paths resolve correctly.
- Verify no local `toFiniteNumber` or `roundNumber` definitions remain in:
  - `tools/shared/vector/vectorGeometryMath.js`
  - `tools/shared/vector/vectorAssetContract.js`
