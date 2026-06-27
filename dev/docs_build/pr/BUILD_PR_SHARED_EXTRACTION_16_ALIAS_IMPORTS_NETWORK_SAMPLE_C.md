# BUILD_PR_SHARED_EXTRACTION_16_ALIAS_IMPORTS_NETWORK_SAMPLE_C

## Purpose
Extend the proven `@shared/*` alias usage to the network_sample_c consumer slice only.

## Single PR Purpose
Switch shared-helper imports in these 2 files from relative paths to the existing `@shared/*` alias:

1. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
2. `games/network_sample_c/game/StateTimelineBuffer.js`

This BUILD assumes the prior alias bootstrap is already present and does not modify config.

## Exact Files Allowed
Edit only these 2 files:

1. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
2. `games/network_sample_c/game/StateTimelineBuffer.js`

Do not edit any other file.

## Alias Assumption
The repo already contains alias support for:

```js
@shared/
```

resolving to:

```js
src/shared/
```

Do not modify `jsconfig.json` or any other config file in this PR.

## Fail-Fast Gate
Before making source edits, confirm:

1. `jsconfig.json` exists
2. it contains `@shared/*` -> `src/shared/*`
3. these shared targets exist:
   - `src/shared/utils/numberUtils.js`
   - `src/shared/utils/objectUtils.js`

If any condition is false:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

## Exact Source Changes

### 1) `games/network_sample_c/game/ReconciliationLayerAdapter.js`
Replace only shared-helper relative imports with alias imports.

Target alias forms:
```js
import { asFiniteNumber, asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
```

Rules:
- preserve existing imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic
- do not add snapshot helper import unless this file already uses it

### 2) `games/network_sample_c/game/StateTimelineBuffer.js`
Replace only shared-helper relative imports with alias imports.

Target alias forms:
```js
import { asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
```

Rules:
- preserve existing imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic
- do not add `asFiniteNumber` unless this file already imports/uses it

## Hard Constraints
- edit only the 2 listed files
- no config changes
- no engine changes
- no advanced-file changes
- no repo-wide alias rollout
- no removal of `.js` extensions
- no helper behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm only the 2 listed files changed
2. Confirm both files now import shared helpers via `@shared/...`
3. Confirm no unrelated imports changed
4. Confirm no logic changed
5. Confirm no config file was touched

## Non-Goals
- no alias rollout to engine
- no alias rollout repo-wide
- no import cleanup outside the 2 exact files
- no toolchain redesign
- no helper redesign
