# BUILD_PR_SHARED_EXTRACTION_08_IS_PLAIN_OBJECT_ADVANCED_ONLY

## Purpose
Remove any remaining advanced-local `isPlainObject` duplication from the two advanced promotion/state modules and switch them to the shared object helper.

## Single PR Purpose
Normalize `isPlainObject` usage in:

- `src/advanced/promotion/createPromotionGate.js`
- `src/advanced/state/createWorldGameStateSystem.js`

This BUILD does **not** change any other helper or file.

## Exact Files Allowed
Edit only these 3 files:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`
3. `src/shared/utils/objectUtils.js` **only if needed to confirm/export existing shared `isPlainObject`**

Do not edit any other file.

## Shared Dependency Assumption
Use the shared helper path:

- `src/shared/utils/objectUtils.js`

## Fail-Fast Gate
Before making source edits, confirm `src/shared/utils/objectUtils.js` already exists and exports `isPlainObject`.

If either condition is false:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

Do **not** create a new shared object helper in this PR.

## Exact Source Changes

### 1) `src/advanced/promotion/createPromotionGate.js`
If a local `isPlainObject` function definition exists:
- remove the local `isPlainObject` function definition
- add exactly one import for `isPlainObject` from:

```js
import { isPlainObject } from '../../shared/utils/objectUtils.js';
```

If an import for `isPlainObject` already exists, do not duplicate it.

If no local `isPlainObject` function definition exists:
- leave this file unchanged

### 2) `src/advanced/state/createWorldGameStateSystem.js`
If a local `isPlainObject` function definition exists:
- remove the local `isPlainObject` function definition
- add exactly one import for `isPlainObject` from:

```js
import { isPlainObject } from '../../shared/utils/objectUtils.js';
```

If an import for `isPlainObject` already exists, do not duplicate it.

If no local `isPlainObject` function definition exists:
- leave this file unchanged

### 3) `src/shared/utils/objectUtils.js`
Do not modify implementation logic.

Allowed edit only:
- if `isPlainObject` already exists in this file but is not exported, make the minimum export change required

If `isPlainObject` is already exported, leave this file unchanged.

## Hard Constraints
- do not edit any file other than the 3 listed above
- do not change `asFiniteNumber`
- do not change `asPositiveInteger`
- do not change `getState`
- do not create new shared helper files
- do not perform repo-wide helper cleanup
- do not modify logic or behavior
- do not normalize any other imports

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/utils/objectUtils.js` exists
3. Confirm `src/shared/utils/objectUtils.js` exports `isPlainObject`
4. Confirm local `isPlainObject` function definitions no longer exist in:
   - `src/advanced/promotion/createPromotionGate.js` (if one existed before)
   - `src/advanced/state/createWorldGameStateSystem.js` (if one existed before)
5. Confirm any updated advanced file imports `isPlainObject` from exactly:
   - `../../shared/utils/objectUtils.js`
6. Confirm no other helper definitions or logic changed

## Non-Goals
- no changes to `src/advanced/state/events.js`
- no changes to `src/advanced/state/initialState.js`
- no changes to `src/advanced/state/transitions.js`
- no broader object helper normalization
- no new helper creation
- no refactor beyond this exact duplicate-removal step
