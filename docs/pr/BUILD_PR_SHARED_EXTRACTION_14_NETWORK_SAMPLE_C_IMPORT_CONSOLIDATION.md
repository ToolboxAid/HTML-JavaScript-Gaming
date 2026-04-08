# BUILD_PR_SHARED_EXTRACTION_14_NETWORK_SAMPLE_C_IMPORT_CONSOLIDATION

## Purpose
Consolidate duplicate shared-helper import lines inside the network_sample_c game slice without changing behavior.

## Single PR Purpose
Normalize only shared-helper import structure in:

- `games/network_sample_c/game/ReconciliationLayerAdapter.js`
- `games/network_sample_c/game/StateTimelineBuffer.js`

This BUILD does **not** remove or add helper usage. It only consolidates import statements from the same shared module when safe.

## Exact Files Allowed
Edit only these 2 files:

1. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
2. `games/network_sample_c/game/StateTimelineBuffer.js`

Do not edit any other file.

## Exact Consolidation Rules

### Shared number helper imports
If a file contains multiple import lines from:

```js
../../../src/shared/utils/numberUtils.js
```

and those imports can be combined without changing meaning, consolidate them into one import line.

Example target form:
```js
import { asFiniteNumber, asPositiveInteger } from "../../../src/shared/utils/numberUtils.js";
```

### Shared object helper imports
If a file contains multiple import lines from:

```js
../../../src/shared/utils/objectUtils.js
```

and those imports can be combined without changing meaning, consolidate them into one import line.

Example target form:
```js
import { isPlainObject } from "../../../src/shared/utils/objectUtils.js";
```

## File-Specific Rules

### 1) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
Allowed:
- combine multiple imports from `../../../src/shared/utils/numberUtils.js` into one line
- combine multiple imports from `../../../src/shared/utils/objectUtils.js` into one line
- remove duplicate imported specifiers if present

Not allowed:
- no helper additions
- no helper removals if the helper is used
- no logic changes
- no edits to unrelated imports

### 2) `games/network_sample_c/game/StateTimelineBuffer.js`
Allowed:
- combine multiple imports from `../../../src/shared/utils/numberUtils.js` into one line
- combine multiple imports from `../../../src/shared/utils/objectUtils.js` into one line
- remove duplicate imported specifiers if present

Not allowed:
- no helper additions
- no helper removals if the helper is used
- no logic changes
- no edits to unrelated imports

## Hard Constraints
- do not edit any file other than the 2 listed above
- do not change import paths
- do not introduce alias imports
- do not reorder unrelated imports
- do not change formatting beyond the minimum needed to consolidate shared-helper imports
- do not touch advanced files
- do not touch shared helper files
- keep one PR purpose only

## Validation Checklist
1. Confirm only the 2 listed files changed
2. Confirm each shared module is imported at most once per file:
   - `../../../src/shared/utils/numberUtils.js`
   - `../../../src/shared/utils/objectUtils.js`
3. Confirm no used helper import was removed
4. Confirm no new helper import was added unless it only came from consolidation of already-present imports
5. Confirm no logic changed

## Non-Goals
- no alias migration
- no repo-wide import consolidation
- no formatting cleanup beyond minimum consolidation
- no helper behavior changes
- no consumer redesign
