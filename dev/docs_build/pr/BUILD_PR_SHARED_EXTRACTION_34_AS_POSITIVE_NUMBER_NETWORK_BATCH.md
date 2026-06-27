# BUILD_PR_SHARED_EXTRACTION_34_AS_POSITIVE_NUMBER_NETWORK_BATCH

## Purpose
Centralize duplicated `asPositiveNumber(value, fallback)` implementations across the exact network sample batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `asPositiveNumber(value, fallback)`

## Exact Files Allowed

### Shared source
1. `src/shared/utils/numberUtils.js`

### Consumer files
2. `games/network_sample_a/game/FakeLoopbackNetworkModel.js`
3. `games/network_sample_a/game/NetworkSampleAScene.js`
4. `games/network_sample_b/game/FakeHostClientNetworkModel.js`
5. `games/network_sample_b/game/NetworkSampleBScene.js`
6. `games/network_sample_c/game/FakeDivergenceTraceNetworkModel.js`
7. `games/network_sample_c/game/NetworkSampleCScene.js`

Do not edit any other file.

## Source of Truth
This exact file list comes from the provided duplicate report entry for:

`function asPositiveNumber(value, fallback)`

No other numeric helpers are in scope for this PR.

## Shared Helper Assumption
Use the existing shared utility:

`src/shared/utils/numberUtils.js`

Fail fast unless that file exists and exports:

- `asPositiveNumber`

If the file exists and contains `asPositiveNumber` but does not export it correctly, the only allowed shared-file change is the minimum export-only fix.

If the helper does not exist in the shared file, create ONLY this helper in `src/shared/utils/numberUtils.js` by copying one existing local implementation exactly, with no behavior change and no other edits to that file.

## Exact Consumer Changes
For each of the 6 listed consumer files:

If the file contains a local function definition matching:
```js
function asPositiveNumber(value, fallback)
```
then:
- remove the local `asPositiveNumber(value, fallback)` function definition
- import `asPositiveNumber` from the correct relative path to:
  - `src/shared/utils/numberUtils.js`
- if the file already imports from that module, add `asPositiveNumber` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `asPositiveNumber`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/numberUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes outside `src/shared/utils/numberUtils.js`
- no game files outside the 6 listed consumers
- no sample files
- no repo-wide number helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 7 listed files changed
2. Confirm `src/shared/utils/numberUtils.js` exports `asPositiveNumber`
3. Confirm local `function asPositiveNumber(value, fallback)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `asPositiveNumber` from the correct relative path to `src/shared/utils/numberUtils.js`
5. Confirm no unrelated engine, game, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `asPositiveInteger`
- no cleanup of `asPositiveInt`
- no cleanup outside the 6 listed consumer files
- no refactor beyond this exact duplicate-removal batch
