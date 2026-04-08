# BUILD_PR_SHARED_EXTRACTION_46_STRINGIFY_VALUE_INSPECTOR_BATCH

## Purpose
Centralize duplicated `stringifyValue(value)` implementations across the exact inspector/command-pack batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `stringifyValue(value)`

## Exact Files Allowed

### New shared file
1. `tools/dev/shared/stringifyValueUtils.js`

### Consumer files
2. `src/engine/debug/inspectors/viewModels/stateDiffInspectorViewModel.js`
3. `tools/dev/commandPacks/inspectorCommandPack.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function stringifyValue(value)`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`tools/dev/shared/stringifyValueUtils.js`

Export exactly:

```js
export function stringifyValue(value) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `stringifyValue(value)`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains a local function definition matching:
```js
function stringifyValue(value)
```
then:
- remove the local `stringifyValue(value)` function definition
- import `stringifyValue` from the correct relative path to:
  - `tools/dev/shared/stringifyValueUtils.js`
- if the file already imports from that module, add `stringifyValue` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `stringifyValue`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`tools/dev/shared/stringifyValueUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no files outside the 2 listed consumers plus the one new shared file
- no repo-wide stringify helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `tools/dev/shared/stringifyValueUtils.js` exists and exports `stringifyValue`
3. Confirm local `function stringifyValue(value)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `stringifyValue` from the correct relative path to `tools/dev/shared/stringifyValueUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
