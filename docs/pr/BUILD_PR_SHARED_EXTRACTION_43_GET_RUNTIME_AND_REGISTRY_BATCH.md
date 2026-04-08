# BUILD_PR_SHARED_EXTRACTION_43_GET_RUNTIME_AND_REGISTRY_BATCH

## Purpose
Centralize duplicated `getRuntimeAndRegistry(context)` implementations across the exact command-pack/preset batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `getRuntimeAndRegistry(context)`

## Exact Files Allowed

### New shared file
1. `tools/dev/shared/runtimeRegistryUtils.js`

### Consumer files
2. `tools/dev/commandPacks/groupCommandPack.js`
3. `tools/dev/commandPacks/overlayCommandPack.js`
4. `tools/dev/presets/debugPresetApplier.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function getRuntimeAndRegistry(context)`

Only the 3 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`tools/dev/shared/runtimeRegistryUtils.js`

Export exactly:

```js
export function getRuntimeAndRegistry(context) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `getRuntimeAndRegistry(context)`

## Exact Consumer Changes
For each of the 3 listed consumer files:

If the file contains a local function definition matching:
```js
function getRuntimeAndRegistry(context)
```
then:
- remove the local `getRuntimeAndRegistry(context)` function definition
- import `getRuntimeAndRegistry` from the correct relative path to:
  - `../shared/runtimeRegistryUtils.js` for command pack files
  - `../shared/runtimeRegistryUtils.js` for `tools/dev/presets/debugPresetApplier.js`
- if the file already imports from that module, add `getRuntimeAndRegistry` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `getRuntimeAndRegistry`, leave it unchanged.

## Relative Import Rule
Use exactly:

`../shared/runtimeRegistryUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no files outside the 3 listed consumers plus the one new shared file
- no repo-wide preset/command-pack helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 4 listed files changed
2. Confirm `tools/dev/shared/runtimeRegistryUtils.js` exists and exports `getRuntimeAndRegistry`
3. Confirm local `function getRuntimeAndRegistry(context)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `getRuntimeAndRegistry` from `../shared/runtimeRegistryUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup outside the 3 listed consumer files
- no refactor beyond this exact duplicate-removal batch
