# BUILD_PR_SHARED_EXTRACTION_39_SAFE_NORMALIZE_AITARGETDUMMY_BATCH

## Purpose
Centralize duplicated `safeNormalize(x, y)` implementations across the exact AITargetDummy batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `safeNormalize(x, y)`

## Exact Files Allowed

### New shared file
1. `src/shared/math/vectorNormalizeUtils.js`

### Consumer files
2. `games/AITargetDummy/game/AITargetDummyController.js`
3. `games/AITargetDummy/game/AITargetDummyWorld.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function safeNormalize(x, y)`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`src/shared/math/vectorNormalizeUtils.js`

Export exactly:

```js
export function safeNormalize(x, y) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `safeNormalize(x, y)`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains a local function definition matching:
```js
function safeNormalize(x, y)
```
then:
- remove the local `safeNormalize(x, y)` function definition
- import `safeNormalize` from the correct relative path to:
  - `src/shared/math/vectorNormalizeUtils.js`
- if the file already imports from that module, add `safeNormalize` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `safeNormalize`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/math/vectorNormalizeUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no game files outside the 2 listed consumers
- no sample files
- no repo-wide normalize/vector helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/math/vectorNormalizeUtils.js` exists and exports `safeNormalize`
3. Confirm local `function safeNormalize(x, y)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `safeNormalize` from the correct relative path to `src/shared/math/vectorNormalizeUtils.js`
5. Confirm no unrelated engine, game, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of other vector/math helpers
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
