# BUILD_PR_SHARED_EXTRACTION_15_ALIAS_IMPORTS_ADVANCED_ONLY

## Purpose
Introduce a safe alias-import proof point for shared helpers in the advanced layer only.

## Single PR Purpose
Switch shared-helper imports in these 2 files from relative paths to the `@shared/*` alias:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`

This BUILD includes the minimum repo config needed to make `@shared/*` resolve for this proof-point scope.

## Exact Files Allowed
Edit only these files:

1. `src/advanced/promotion/createPromotionGate.js`
2. `src/advanced/state/createWorldGameStateSystem.js`

Plus the minimum alias-config file(s) already present in the repo, chosen from this allowed set only if needed:

3. `jsconfig.json`
4. `tsconfig.json`
5. `vite.config.js`
6. `vite.config.mjs`
7. `webpack.config.js`

Do not edit any other file.
Do not create a new config file if one suitable file already exists.

## Alias Target
Use this alias namespace only:

```js
@shared/
```

It must resolve to:

```js
src/shared/
```

## Fail-Fast Gate
Before making source edits:

1. Identify one existing config file from the allowed set that is actually used by the repo for import resolution.
2. Confirm it can support the `@shared/*` alias with a minimal change.

If no suitable existing config file is present or the resolution mechanism is unclear:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

Do **not** invent a new toolchain or add broad config in this PR.

## Exact Source Changes

### 1) `src/advanced/promotion/createPromotionGate.js`
Replace only shared-helper relative imports with alias imports.

Expected alias forms:
```js
import { asFiniteNumber } from '@shared/utils/numberUtils.js';
import { asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '@shared/state/createPromotionStateSnapshot.js';
```

Rules:
- preserve current imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic

### 2) `src/advanced/state/createWorldGameStateSystem.js`
Replace only shared-helper relative imports with alias imports.

Expected alias forms:
```js
import { asFiniteNumber } from '@shared/utils/numberUtils.js';
import { asPositiveInteger } from '@shared/utils/numberUtils.js';
import { isPlainObject } from '@shared/utils/objectUtils.js';
import { createPromotionStateSnapshot } from '@shared/state/createPromotionStateSnapshot.js';
```

Rules:
- preserve current imported specifiers
- if imports from the same aliased module can be combined without changing behavior/style, minimum-edit combination is allowed
- do not touch unrelated imports
- do not change logic

## Exact Config Change Rules
In the one chosen existing config file:
- add the minimum alias mapping necessary for `@shared/*` -> `src/shared/*`
- do not add unrelated aliases
- do not reformat the whole config
- do not change build behavior beyond what is needed for alias resolution
- do not add testing, lint, or IDE settings beyond the single alias need in the chosen file

## Hard Constraints
- do not edit any file other than the 2 source files plus one chosen existing config file from the allowed set
- do not touch engine files
- do not touch sample files
- do not migrate aliases repo-wide
- do not remove `.js` extensions from imports
- do not change helper behavior
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than 3 files changed
2. Confirm exactly 2 advanced files now import shared helpers via `@shared/...`
3. Confirm the chosen existing config file resolves `@shared/*` to `src/shared/*`
4. Confirm no unrelated imports changed
5. Confirm no logic changed
6. Confirm no sample or engine file was touched

## Non-Goals
- no repo-wide alias migration
- no alias rollout to samples
- no alias rollout to engine
- no path cleanup outside the 2 exact advanced files
- no toolchain redesign
