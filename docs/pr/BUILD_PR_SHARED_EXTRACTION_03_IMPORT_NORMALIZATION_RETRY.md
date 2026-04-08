# BUILD_PR_SHARED_EXTRACTION_03_IMPORT_NORMALIZATION_RETRY

## Purpose
Normalize import usage for helpers already extracted to `src/shared`, using an explicit file list and exact import replacements only.

## Source Basis
This BUILD is derived from the uploaded repo snapshot used in-session.
This BUILD replaces the prior non-executable import-normalization BUILD.

## Single PR Purpose
Normalize imports for:
- `isPlainObject`
- `asPositiveInteger`

This retry does **not** include:
- `asFiniteNumber`
- `getState`

Reason:
No explicit import-update targets for those helpers were identified in the uploaded repo snapshot, so including them would require guessing.

## Hard Constraints
- DO NOT scan the repo beyond the exact files listed below
- DO NOT modify logic
- DO NOT move files
- DO NOT rename helpers
- DO NOT expand scope to additional helpers or files
- Keep one PR purpose only

## Exact File List + Exact Import Map

### 1) `src/advanced/state/events.js`
Replace:
```js
import { cloneDeep, isPlainObject } from './utils.js';
```

With:
```js
import { cloneDeep } from './utils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
```

### 2) `src/advanced/state/initialState.js`
Replace:
```js
import { isPlainObject, mergeDeep } from './utils.js';
```

With:
```js
import { mergeDeep } from './utils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
```

### 3) `src/advanced/state/transitions.js`
Replace:
```js
import { isPlainObject } from './utils.js';
```

With:
```js
import { isPlainObject } from '../../shared/utils/objectUtils.js';
```

### 4) `src/engine/debug/inspectors/host/debugInspectorHost.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

### 5) `src/engine/debug/inspectors/registry/debugInspectorRegistry.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

### 6) `src/engine/debug/inspectors/viewModels/entityInspectorViewModel.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

### 7) `src/engine/debug/inspectors/viewModels/eventStreamInspectorViewModel.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

### 8) `src/engine/debug/inspectors/viewModels/stateDiffInspectorViewModel.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

### 9) `src/engine/debug/inspectors/viewModels/timelineInspectorViewModel.js`
Current import block contains `asPositiveInteger` from `../shared/inspectorUtils.js`.

Update to:
- remove `asPositiveInteger` from the existing `../shared/inspectorUtils.js` import block
- add:
```js
import { asPositiveInteger } from '../../../../shared/utils/numberUtils.js';
```

## Required Execution Rules
- Only edit the 9 files listed above
- Do not touch any other import lines
- Preserve existing import ordering/style as much as possible
- If a file already matches the target import state, leave it unchanged
- No repo-wide cleanup pass

## Validation Checklist
1. Confirm only the 9 listed files changed
2. Confirm `isPlainObject` is no longer imported from `./utils.js` in:
   - `src/advanced/state/events.js`
   - `src/advanced/state/initialState.js`
   - `src/advanced/state/transitions.js`
3. Confirm `asPositiveInteger` is no longer imported from `../shared/inspectorUtils.js` in:
   - `src/engine/debug/inspectors/host/debugInspectorHost.js`
   - `src/engine/debug/inspectors/registry/debugInspectorRegistry.js`
   - `src/engine/debug/inspectors/viewModels/entityInspectorViewModel.js`
   - `src/engine/debug/inspectors/viewModels/eventStreamInspectorViewModel.js`
   - `src/engine/debug/inspectors/viewModels/stateDiffInspectorViewModel.js`
   - `src/engine/debug/inspectors/viewModels/timelineInspectorViewModel.js`
4. Confirm the new shared imports resolve to:
   - `../../shared/utils/objectUtils.js`
   - `../../../../shared/utils/numberUtils.js`
5. Confirm no logic/runtime changes were made

## Non-Goals
- No changes to `asFiniteNumber`
- No changes to `getState`
- No helper movement
- No dedupe beyond the 9 exact files above
- No alias-path migration
