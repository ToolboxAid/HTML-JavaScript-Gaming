# BUILD_PR_SHARED_EXTRACTION_07_AS_POSITIVE_INTEGER_ADVANCED_ONLY

## Purpose
Remove the remaining duplicated local `asPositiveInteger` helpers from the two advanced promotion/state modules and switch them to the existing shared number helper.

## Single PR Purpose
Centralize `asPositiveInteger` usage in:

- `src/advanced/promotion/createPromotionGate.js`
- `src/advanced/state/createWorldGameStateSystem.js`

This BUILD does **not** change any other helper or file.

## Exact Files Allowed
Edit only these 2 files:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`

Do not edit any other file.

## Shared Dependency Assumption
Use the existing shared helper already established earlier in this workflow:

- `src/shared/utils/numberUtils.js`

This BUILD assumes `numberUtils.js` already exports `asPositiveInteger`.

Do **not** modify `src/shared/utils/numberUtils.js` in this PR.

## Exact Source Changes

### 1) `src/advanced/promotion/createPromotionGate.js`
- remove the local `asPositiveInteger` function definition
- keep all other local helpers exactly as they are
- add exactly one import for `asPositiveInteger` from:

```js
import { asPositiveInteger } from '../../shared/utils/numberUtils.js';
```

If an import for `asPositiveInteger` already exists, do not duplicate it.

### 2) `src/advanced/state/createWorldGameStateSystem.js`
- remove the local `asPositiveInteger` function definition
- keep all other local helpers exactly as they are
- add exactly one import for `asPositiveInteger` from:

```js
import { asPositiveInteger } from '../../shared/utils/numberUtils.js';
```

If an import for `asPositiveInteger` already exists, do not duplicate it.

## Hard Constraints
- do not edit any file other than the 2 listed above
- do not change `asFiniteNumber`
- do not change `isPlainObject`
- do not change `getState`
- do not change promotion snapshot imports
- do not modify logic or behavior
- do not perform repo-wide helper cleanup
- do not create any new file
- do not modify `src/shared/utils/numberUtils.js`

## Validation Checklist
1. Confirm only the 2 listed files changed
2. Confirm local `asPositiveInteger` function definitions no longer exist in:
   - `src/advanced/promotion/createPromotionGate.js`
   - `src/advanced/state/createWorldGameStateSystem.js`
3. Confirm both files import `asPositiveInteger` from exactly:
   - `../../shared/utils/numberUtils.js`
4. Confirm there is only one `asPositiveInteger` import per file
5. Confirm no other helper definitions or logic changed

## Non-Goals
- no changes to any debug inspector files
- no changes to `src/shared/utils/numberUtils.js`
- no broader number helper normalization
- no repo-wide import cleanup
- no refactor beyond this exact duplicate-removal step
