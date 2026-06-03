# BUILD_PR_SHARED_EXTRACTION_11_CONSUMER_EDGE_VALIDATION

## Purpose
Validate the immediate consumer edges for the helpers extracted into shared utilities and fix only direct import-path breakage if present.

## Single PR Purpose
Check and, if necessary, repair direct consumer imports for these shared helpers only:

- `asFiniteNumber`
- `asPositiveInteger`
- `isPlainObject`
- `createPromotionStateSnapshot`

This BUILD is a narrow consumer-edge validation pass, not a refactor.

## Exact Files Allowed
Edit only these files if needed:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`
3. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
4. `src/shared/utils/numberUtils.js`
5. `src/shared/utils/objectUtils.js`
6. `src/shared/state/createPromotionStateSnapshot.js`

Do not edit any other file.

## Allowed Validation Scope
Only validate the direct import/export edge among the 6 exact files above.

That means:
- confirm the 3 consumer files import the expected shared helpers correctly
- confirm the 3 shared files export the expected helpers correctly

Do not inspect, modify, or normalize unrelated consumers.

## Exact Expected Consumer Imports

### 1) `src/advanced/promotion/createPromotionGate.js`
Expected shared helper imports:
```js
import { asFiniteNumber } from '../../shared/utils/numberUtils.js';
import { asPositiveInteger } from '../../shared/utils/numberUtils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '../shared/state/createPromotionStateSnapshot.js';
```

Rules:
- if imports are already correct, leave them unchanged
- if duplicate imports exist for any of the listed helpers, collapse to one correct import
- if one combined import from the same file is possible without changing behavior/style, prefer the minimum-edit option
- do not touch unrelated imports

### 2) `src/advanced/state/createWorldGameStateSystem.js`
Expected shared helper imports:
```js
import { asFiniteNumber } from '../../shared/utils/numberUtils.js';
import { asPositiveInteger } from '../../shared/utils/numberUtils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '../../shared/state/createPromotionStateSnapshot.js';
```

Rules:
- if imports are already correct, leave them unchanged
- if duplicate imports exist for any of the listed helpers, collapse to one correct import
- if one combined import from the same file is possible without changing behavior/style, prefer the minimum-edit option
- do not touch unrelated imports

### 3) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
Expected shared helper import:
```js
import { asFiniteNumber } from '../../../src/shared/utils/numberUtils.js';
```

Rules:
- if import is already correct, leave it unchanged
- do not add any other helper import to this file
- do not touch unrelated imports

## Exact Expected Shared Exports

### 4) `src/shared/utils/numberUtils.js`
Must export exactly these helpers for this PR's validation scope:
- `asFiniteNumber`
- `asPositiveInteger`

Allowed edits:
- minimum export-fix only if one of those helpers is present but not exported correctly
- if exports are already correct, leave unchanged

Not allowed:
- no behavior changes
- no new helper additions
- no renaming

### 5) `src/shared/utils/objectUtils.js`
Must export:
- `isPlainObject`

Allowed edits:
- minimum export-fix only if present but not exported correctly
- if already correct, leave unchanged

Not allowed:
- no behavior changes
- no new helper additions
- no renaming

### 6) `src/shared/state/createPromotionStateSnapshot.js`
Must export:
- `createPromotionStateSnapshot`

Allowed edits:
- minimum export-fix only if present but not exported correctly
- if already correct, leave unchanged

Not allowed:
- no behavior changes
- no renaming
- no file move

## Fail-Fast Rule
If any of the 3 shared files do not exist:
- stop
- report blocker
- make no changes
- do not produce a delta ZIP

If a required helper is missing entirely from a listed shared file:
- stop
- report blocker
- make no changes
- do not invent implementation in this PR

## Hard Constraints
- edit only the 6 listed files
- fix import/export edge issues only
- no logic changes
- no file creation
- no repo-wide scan
- no broader consumer normalization
- no engine or sample refactor
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 6 listed files changed
2. Confirm `src/shared/utils/numberUtils.js` exports:
   - `asFiniteNumber`
   - `asPositiveInteger`
3. Confirm `src/shared/utils/objectUtils.js` exports:
   - `isPlainObject`
4. Confirm `src/shared/state/createPromotionStateSnapshot.js` exports:
   - `createPromotionStateSnapshot`
5. Confirm the 3 consumer files import the expected helpers from the exact paths listed above
6. Confirm no helper behavior changed
7. Confirm no unrelated consumers were touched

## Non-Goals
- no repo-wide consumer audit
- no alias path migration
- no formatting cleanup
- no lint-only edits
- no helper redesign
- no new shared helper creation
