# BUILD_PR_SHARED_EXTRACTION_12_NETWORK_SAMPLE_C_NUMBER_HELPERS

## Purpose
Remove remaining local number-helper duplication in the network_sample_c game slice and switch those files to the shared number helper module.

## Single PR Purpose
Normalize only these helper usages inside network_sample_c:
- `asFiniteNumber`
- `asPositiveInteger`

Target files:
- `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- `games/network_sample_c/game/StateTimelineBuffer.js`

This BUILD does **not** change any other helper or file.

## Exact Files Allowed
Edit only these 3 files:

1. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
2. `games/network_sample_c/game/StateTimelineBuffer.js`
3. `src/shared/utils/numberUtils.js` **only if minimum export fix is required**

Do not edit any other file.

## Shared Dependency Assumption
Use the shared helper path:

- `src/shared/utils/numberUtils.js`

Consumer import path from both network_sample_c files must be:

```js
../../../src/shared/utils/numberUtils.js
```

## Fail-Fast Gate
Before making consumer edits, confirm:

1. `src/shared/utils/numberUtils.js` exists
2. it exports `asFiniteNumber`
3. it exports `asPositiveInteger`

If any condition is false:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

Do **not** create a new shared number helper in this PR.

## Exact Source Changes

### 1) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- remove the local `asPositiveInteger` function definition
- remove the local `asFiniteNumber` function definition
- add exactly one shared import, or minimally update the existing import block, to provide:

```js
import { asFiniteNumber, asPositiveInteger } from "../../../src/shared/utils/numberUtils.js";
```

Rules:
- if separate imports from the same shared file already exist, collapse only if minimal and safe
- do not duplicate imports
- do not touch `sanitizeText`
- do not touch snapshot cloning helpers
- do not change logic

### 2) `games/network_sample_c/game/StateTimelineBuffer.js`
- remove the local `asPositiveInteger` function definition
- add exactly one shared import, or minimally update the existing import block, to provide:

```js
import { asPositiveInteger } from "../../../src/shared/utils/numberUtils.js";
```

Rules:
- do not add `asFiniteNumber` here
- do not touch `normalizeFrameId`
- do not touch snapshot cloning helpers
- do not change logic

### 3) `src/shared/utils/numberUtils.js`
Do not modify implementation logic.

Allowed edit only:
- if `asFiniteNumber` or `asPositiveInteger` already exists in this file but is not exported correctly, make the minimum export change required

If both helpers are already exported, leave this file unchanged.

## Hard Constraints
- do not edit any file other than the 3 listed above
- do not change helper behavior
- do not modify `network_sample_a`
- do not modify engine debug inspector files
- do not change `isPlainObject`
- do not change promotion snapshot logic
- do not perform repo-wide helper cleanup
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/utils/numberUtils.js` exists
3. Confirm `src/shared/utils/numberUtils.js` exports:
   - `asFiniteNumber`
   - `asPositiveInteger`
4. Confirm local helper definitions no longer exist in:
   - `games/network_sample_c/game/ReconciliationLayerAdapter.js` for:
     - `asFiniteNumber`
     - `asPositiveInteger`
   - `games/network_sample_c/game/StateTimelineBuffer.js` for:
     - `asPositiveInteger`
5. Confirm consumer imports now point exactly to:
   - `../../../src/shared/utils/numberUtils.js`
6. Confirm no other logic changed

## Non-Goals
- no work in `games/network_sample_a/server/networkSampleADashboardServer.mjs`
- no work in `src/engine/debug/inspectors/shared/inspectorUtils.js`
- no broader number helper normalization
- no new shared helper creation
- no refactor beyond this exact duplicate-removal step
