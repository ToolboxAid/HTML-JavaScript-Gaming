# BUILD PR — Promote `asNumber(value, fallback = 0)` into shared math

## Purpose
Move the duplicate `asNumber` helper into the canonical numeric home and migrate the exact duplicate sites.

## Exact Target Files
- `src/shared/math/numberNormalization.js`
- `src/shared/utils/networkDebugUtils.js`
- `src/engine/debug/network/shared/networkDebugUtils.js`

## Required Code Changes
1. In `src/shared/math/numberNormalization.js`
   - add/export `asNumber(value, fallback = 0)`
   - preserve current runtime behavior of the duplicate helper exactly

2. In `src/shared/utils/networkDebugUtils.js`
   - stop defining local `asNumber`
   - import `asNumber` from `src/shared/math/numberNormalization.js`
   - preserve the file's existing public API

3. In `src/engine/debug/network/shared/networkDebugUtils.js`
   - stop defining local `asNumber`
   - import `asNumber` from `src/shared/math/numberNormalization.js`
   - preserve the file's existing public API

## Hard Constraints
- exact files only
- do not touch `asObject`, `asArray`, or any other helper in this PR
- do not modify any consumer files outside the exact list
- do not rename exports other than replacing local helper definitions with shared import usage
- do not refactor unrelated logic

## Acceptance Criteria
- one canonical `asNumber` implementation exists in `src/shared/math/numberNormalization.js`
- both network debug utility files use the shared math implementation
- no local `asNumber` implementation remains in the two target files
- no import/export breakage
