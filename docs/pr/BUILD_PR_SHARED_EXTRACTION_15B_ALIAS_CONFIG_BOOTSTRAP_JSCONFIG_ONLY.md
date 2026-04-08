# BUILD_PR_SHARED_EXTRACTION_15B_ALIAS_CONFIG_BOOTSTRAP_JSCONFIG_ONLY

## Purpose
Unblock the alias-import proof point by adding one minimal repo config file that supports `@shared/*` path resolution for editor/tooling use, then switching the two advanced files to that alias.

## Single PR Purpose
Create exactly one new config file:

- `jsconfig.json`

Then update only these 2 files to use `@shared/*` imports:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`

This BUILD exists because the prior alias BUILD fail-fast stopped: no suitable existing config file from the allowed set was present.

## Exact Files Allowed
Edit only these 3 files:

1. `jsconfig.json` **(new file)**
2. `src/advanced/promotion/createPromotionGate.js`
3. `src/advanced/state/createWorldGameStateSystem.js`

Do not edit any other file.

## Exact New File
Create:

`jsconfig.json`

With exactly this content:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

Do not add any other alias.
Do not add any other compiler options.
Do not create tsconfig, vite, or webpack config in this PR.

## Exact Source Changes

### 1) `src/advanced/promotion/createPromotionGate.js`
Replace only shared-helper relative imports with alias imports.

Target alias forms:
```js
import { asFiniteNumber } from '@shared/utils/numberUtils.js';
import { asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '@shared/state/createPromotionStateSnapshot.js';
```

Rules:
- preserve existing imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic

### 2) `src/advanced/state/createWorldGameStateSystem.js`
Replace only shared-helper relative imports with alias imports.

Target alias forms:
```js
import { asFiniteNumber } from '@shared/utils/numberUtils.js';
import { asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '@shared/state/createPromotionStateSnapshot.js';
```

Rules:
- preserve existing imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic

## Fail-Fast Gate
Before editing the 2 source files, confirm these shared targets exist:

- `src/shared/utils/numberUtils.js`
- `src/shared/utils/objectUtils.js`
- `src/shared/state/createPromotionStateSnapshot.js`

If any is missing:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

## Hard Constraints
- edit only the 3 listed files
- no engine files
- no sample files
- no repo-wide alias rollout
- no removal of `.js` extensions
- no helper behavior changes
- no extra config beyond the exact `jsconfig.json` content above
- keep one PR purpose only

## Validation Checklist
1. Confirm only the 3 listed files changed
2. Confirm `jsconfig.json` exists and matches the exact content in this BUILD
3. Confirm exactly 2 advanced files now import shared helpers via `@shared/...`
4. Confirm no unrelated imports changed
5. Confirm no logic changed
6. Confirm no sample or engine file was touched

## Non-Goals
- no repo-wide alias migration
- no alias rollout to samples
- no alias rollout to engine
- no Vite/Webpack/TS config work
- no path cleanup outside the 2 exact advanced files
- no toolchain redesign
