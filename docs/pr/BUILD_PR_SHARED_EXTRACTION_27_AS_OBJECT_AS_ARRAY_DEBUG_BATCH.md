# BUILD_PR_SHARED_EXTRACTION_27_AS_OBJECT_AS_ARRAY_DEBUG_BATCH

## Purpose
Eliminate duplicated `asObject(value)` and `asArray(value)` implementations across the debug slice by centralizing them to the existing shared debug utility and updating only the listed consumers.

## Single PR Purpose
Normalize only these two helpers:

- `asObject(value)`
- `asArray(value)`

for this exact debug batch:

1. `games/Asteroids/debug/asteroidsShowcaseDebug.js`
2. `games/network_sample_a/debug/networkSampleADebug.js`
3. `games/network_sample_b/debug/networkSampleBDebug.js`
4. `games/network_sample_c/debug/networkSampleCDebug.js`
5. `tools/dev/inspectors/inspectorStore.js`
6. `tools/dev/plugins/debugPluginSystem.js`

This BUILD does **not** change any other helper or file.

## Exact Files Allowed
Edit only these 7 files:

### Canonical shared source
1. `src/engine/debug/inspectors/shared/inspectorUtils.js`

### Consumer files
2. `games/Asteroids/debug/asteroidsShowcaseDebug.js`
3. `games/network_sample_a/debug/networkSampleADebug.js`
4. `games/network_sample_b/debug/networkSampleBDebug.js`
5. `games/network_sample_c/debug/networkSampleCDebug.js`
6. `tools/dev/inspectors/inspectorStore.js`
7. `tools/dev/plugins/debugPluginSystem.js`

Do not edit any other file.

## Source-of-Truth for duplication
This BUILD is based on the duplicate report showing:

- `function asObject(value)` duplicated in the 6 listed consumer files
- `function asArray(value)` duplicated in the same 6 listed consumer files

This PR intentionally handles only this exact batch.

## Shared Helper Assumption
Use the existing canonical shared debug utility:

- `src/engine/debug/inspectors/shared/inspectorUtils.js`

Fail fast unless that file exists and exports:

- `asObject`
- `asArray`

If the file exists and contains one or both helpers but does not export them correctly, the only allowed shared-file change is the minimum export-only fix.

Do not create a new shared file in this PR.

## Exact Change Rules

### Shared source file
#### `src/engine/debug/inspectors/shared/inspectorUtils.js`
Allowed:
- confirm `asObject` exists
- confirm `asArray` exists
- confirm both are exported
- if needed, make the minimum export-only fix

Not allowed:
- no behavior changes
- no renaming
- no adding unrelated helpers
- no refactor

### Consumer files
For each of the 6 listed consumer files:

If a local function definition exists matching:
```js
function asObject(value)
```
then:
- remove the local `asObject` function definition
- import `asObject` from the correct relative path to:
  - `src/engine/debug/inspectors/shared/inspectorUtils.js`

If a local function definition exists matching:
```js
function asArray(value)
```
then:
- remove the local `asArray` function definition
- import `asArray` from the correct relative path to:
  - `src/engine/debug/inspectors/shared/inspectorUtils.js`

Import rules:
- if the file already imports from that shared module, add `asObject` and/or `asArray` to the existing import with the minimum safe edit
- if both helpers are needed from the same module, a single combined import is allowed
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file does not currently contain one or both local helper definitions:
- leave that helper unchanged in that file

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/engine/debug/inspectors/shared/inspectorUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no game main files
- no sample files
- no engine files beyond `src/engine/debug/inspectors/shared/inspectorUtils.js`
- no repo-wide asObject/asArray cleanup
- no helper behavior changes
- no import path normalization beyond this exact helper move
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 7 listed files changed
2. Confirm `src/engine/debug/inspectors/shared/inspectorUtils.js` exports:
   - `asObject`
   - `asArray`
3. Confirm local `function asObject(value)` definitions no longer exist in the changed listed consumer files
4. Confirm local `function asArray(value)` definitions no longer exist in the changed listed consumer files
5. Confirm changed consumer files import `asObject` and/or `asArray` from the correct relative path to `src/engine/debug/inspectors/shared/inspectorUtils.js`
6. Confirm no unrelated engine, game-main, or sample files changed
7. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `asObject/asArray` outside the 6 listed files
- no cleanup of `asNumber`, `sanitizeText`, or any other debug helper
- no refactor beyond this exact duplicate-removal batch
