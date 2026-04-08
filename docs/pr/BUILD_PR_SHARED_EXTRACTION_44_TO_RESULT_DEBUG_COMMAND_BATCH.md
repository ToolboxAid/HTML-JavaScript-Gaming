# BUILD_PR_SHARED_EXTRACTION_44_TO_RESULT_DEBUG_COMMAND_BATCH

## Purpose
Centralize duplicated `toResult(status, title, code, lines, details = {})` implementations across the exact debug-command batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `toResult(status, title, code, lines, details = {})`

## Exact Files Allowed

### New shared file
1. `src/engine/debug/shared/debugCommandResultUtils.js`

### Consumer files
2. `src/engine/debug/inspectors/commands/registerInspectorCommands.js`
3. `tools/dev/presets/debugPresetApplier.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function toResult(status, title, code, lines, details = {})`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`src/engine/debug/shared/debugCommandResultUtils.js`

Export exactly:

```js
export function toResult(status, title, code, lines, details = {}) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `toResult(status, title, code, lines, details = {})`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains a local function definition matching:
```js
function toResult(status, title, code, lines, details = {})
```
then:
- remove the local `toResult(...)` function definition
- import `toResult` from the correct relative path to:
  - `src/engine/debug/shared/debugCommandResultUtils.js`
- if the file already imports from that module, add `toResult` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `toResult`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/engine/debug/shared/debugCommandResultUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no files outside the 2 listed consumers plus the one new shared file
- no repo-wide debug helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/engine/debug/shared/debugCommandResultUtils.js` exists and exports `toResult`
3. Confirm local `function toResult(...)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `toResult` from the correct relative path to `src/engine/debug/shared/debugCommandResultUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `createResult`
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
