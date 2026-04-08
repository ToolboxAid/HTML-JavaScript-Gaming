# BUILD_PR_SHARED_EXTRACTION_41_AS_STRING_ARRAY_PRESET_BATCH

## Purpose
Centralize duplicated `asStringArray(value)` implementations across the exact preset/group-registry batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `asStringArray(value)`

## Exact Files Allowed

### Shared source
1. `src/shared/utils/arrayUtils.js`

### Consumer files
2. `tools/dev/advanced/debugPanelGroupRegistry.js`
3. `tools/dev/presets/debugPresetRegistry.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function asStringArray(value)`

Only the 2 listed consumer files are in scope.

## Shared Helper Assumption
Use the existing shared utility:

`src/shared/utils/arrayUtils.js`

Fail fast unless that file exists and exports:

- `asStringArray`

If the file exists and contains `asStringArray` but does not export it correctly, the only allowed shared-file change is the minimum export-only fix.

If the helper does not exist in the shared file, add ONLY this helper to `src/shared/utils/arrayUtils.js` by copying one existing local implementation exactly, with no behavior change and no unrelated edits.

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains a local function definition matching:
```js
function asStringArray(value)
```
then:
- remove the local `asStringArray(value)` function definition
- import `asStringArray` from the correct relative path to:
  - `src/shared/utils/arrayUtils.js`
- if the file already imports from that module, add `asStringArray` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `asStringArray`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/arrayUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes outside `src/shared/utils/arrayUtils.js`
- no files outside the 2 listed consumers
- no repo-wide array helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/utils/arrayUtils.js` exports `asStringArray`
3. Confirm local `function asStringArray(value)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `asStringArray` from the correct relative path to `src/shared/utils/arrayUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `ensureArray`
- no cleanup of `asArray`
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
