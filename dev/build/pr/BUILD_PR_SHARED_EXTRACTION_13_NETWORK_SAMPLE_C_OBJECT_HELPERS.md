# BUILD_PR_SHARED_EXTRACTION_13_NETWORK_SAMPLE_C_OBJECT_HELPERS

## Purpose
Remove any remaining local `isPlainObject` duplication in network_sample_c and align usage with the shared object helper.

## Single PR Purpose
Normalize `isPlainObject` usage ONLY in:

- `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- `games/network_sample_c/game/StateTimelineBuffer.js`

This BUILD does **not** change any other helper or file.

## Exact Files Allowed
Edit only these 3 files:

1. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
2. `games/network_sample_c/game/StateTimelineBuffer.js`
3. `src/shared/utils/objectUtils.js` (only if minimum export fix is required)

Do not edit any other file.

## Shared Dependency Assumption
Use the shared helper path:

- `src/shared/utils/objectUtils.js`

Consumer import path must be:

```js
../../../src/shared/utils/objectUtils.js
```

## Fail-Fast Gate
Before making consumer edits, confirm:

1. `src/shared/utils/objectUtils.js` exists
2. it exports `isPlainObject`

If any condition is false:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

Do **not** create a new shared object helper in this PR.

## Exact Source Changes

### 1) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
If a local `isPlainObject` function exists:
- remove the local `isPlainObject` function definition
- add exactly one import:

```js
import { isPlainObject } from "../../../src/shared/utils/objectUtils.js";
```

Rules:
- do not duplicate imports
- do not modify other helpers
- do not modify logic

If no local `isPlainObject` exists:
- leave file unchanged

---

### 2) `games/network_sample_c/game/StateTimelineBuffer.js`
If a local `isPlainObject` function exists:
- remove the local `isPlainObject` function definition
- add exactly one import:

```js
import { isPlainObject } from "../../../src/shared/utils/objectUtils.js";
```

Rules:
- do not duplicate imports
- do not modify other helpers
- do not modify logic

If no local `isPlainObject` exists:
- leave file unchanged

---

### 3) `src/shared/utils/objectUtils.js`
Do not modify implementation logic.

Allowed edit only:
- if `isPlainObject` exists but is not exported, make the minimum export change required

If already exported, leave unchanged.

## Hard Constraints
- do not edit any file other than the 3 listed above
- do not change helper behavior
- do not modify number helpers
- do not modify promotion snapshot logic
- do not perform repo-wide cleanup
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/utils/objectUtils.js` exists
3. Confirm `src/shared/utils/objectUtils.js` exports `isPlainObject`
4. Confirm no local `isPlainObject` definitions remain in:
   - `games/network_sample_c/game/ReconciliationLayerAdapter.js` (if originally present)
   - `games/network_sample_c/game/StateTimelineBuffer.js` (if originally present)
5. Confirm consumer imports now point exactly to:
   - `../../../src/shared/utils/objectUtils.js`
6. Confirm no other logic changed

## Non-Goals
- no work in other samples
- no work in advanced layer
- no broader object helper normalization
- no new helper creation
- no refactor beyond this exact duplicate-removal step
