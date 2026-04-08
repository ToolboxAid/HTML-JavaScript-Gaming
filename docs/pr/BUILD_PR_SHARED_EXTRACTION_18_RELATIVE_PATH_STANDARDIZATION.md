# BUILD_PR_SHARED_EXTRACTION_18_RELATIVE_PATH_STANDARDIZATION

## Purpose
Standardize shared-helper import paths to the approved relative-path form and remove any remaining disallowed variants inside the currently normalized slices only.

## Single PR Purpose
Normalize shared imports ONLY in these files:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`
3. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
4. `games/network_sample_c/game/StateTimelineBuffer.js`

This BUILD exists to align current imports with the no-alias / no-fragile-shared-import policy now enforced by the guard.

## Exact Files Allowed
Edit only these 4 files.

Do not edit any other file.

## Approved Relative Path Standard

### Advanced layer
For files under `src/advanced/...`, shared imports must use:

```js
../../shared/
```

Approved exact target forms for:
#### `src/advanced/promotion/createPromotionGate.js`
```js
import { asFiniteNumber, asPositiveInteger } from '../../shared/utils/numberUtils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '../../shared/state/createPromotionStateSnapshot.js';
```

#### `src/advanced/state/createWorldGameStateSystem.js`
```js
import { asFiniteNumber, asPositiveInteger } from '../../shared/utils/numberUtils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '../../shared/state/createPromotionStateSnapshot.js';
```

### network_sample_c layer
For files under `games/network_sample_c/game/...`, shared imports must use:

```js
../../../src/shared/
```

Approved exact target forms for:
#### `games/network_sample_c/game/ReconciliationLayerAdapter.js`
```js
import { asFiniteNumber, asPositiveInteger } from '../../../src/shared/utils/numberUtils.js';
import { isPlainObject } from '../../../src/shared/utils/objectUtils.js';
```

#### `games/network_sample_c/game/StateTimelineBuffer.js`
```js
import { asPositiveInteger } from '../../../src/shared/utils/numberUtils.js';
import { isPlainObject } from '../../../src/shared/utils/objectUtils.js';
```

## Exact Change Rules
For each of the 4 files:

- replace any `@shared/...` import with the approved relative path form above
- replace any disallowed shared relative path variant with the approved form above
- if multiple imports from the same approved module exist, minimum-edit consolidation is allowed
- do not add helper imports that the file does not already use
- do not remove helper imports that the file still uses
- do not touch unrelated imports
- do not change logic

## Fail-Fast Gate
Before editing, confirm these shared targets exist:

- `src/shared/utils/numberUtils.js`
- `src/shared/utils/objectUtils.js`
- `src/shared/state/createPromotionStateSnapshot.js`

If any is missing:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

## Hard Constraints
- edit only the 4 listed files
- no config changes
- no guard changes
- no engine changes
- no broader repo-wide import pass
- no alias usage after this BUILD
- no removal of `.js` extensions
- keep one PR purpose only

## Validation Checklist
1. Confirm only the 4 listed files changed
2. Confirm no `@shared/` imports remain in the 4 listed files
3. Confirm advanced files use only `../../shared/...` imports for shared helpers
4. Confirm network_sample_c files use only `../../../src/shared/...` imports for shared helpers
5. Confirm no unrelated imports changed
6. Confirm no logic changed

## Non-Goals
- no repo-wide path cleanup
- no changes to the guard script
- no alias bootstrap cleanup outside these 4 files
- no helper behavior changes
- no import cleanup outside the approved shared helper imports listed above
