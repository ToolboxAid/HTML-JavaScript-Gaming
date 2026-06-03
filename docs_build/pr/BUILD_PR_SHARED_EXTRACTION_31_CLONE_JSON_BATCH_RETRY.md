# BUILD_PR_SHARED_EXTRACTION_31_CLONE_JSON_BATCH_RETRY

## Purpose
Centralize duplicated `cloneJson(value)` implementations across the exact tools/dev + tools/shared batch identified in the duplicate report, without guessing scope.

## Single PR Purpose
Normalize ONLY this helper:

- `cloneJson(value)`

## Exact Files Allowed

### New shared file
1. `src/shared/utils/jsonUtils.js`

### Consumer files
2. `tools/dev/devConsoleIntegration.js`
3. `tools/dev/advanced/debugMacroRegistry.js`
4. `tools/dev/advanced/debugPanelGroupRegistry.js`
5. `tools/dev/inspectors/inspectorStore.js`
6. `tools/dev/plugins/debugPluginSystem.js`
7. `tools/dev/presets/debugPresetApplier.js`
8. `tools/dev/presets/debugPresetRegistry.js`
9. `tools/shared/assetMarketplace.js`
10. `tools/shared/asteroidsPlatformDemo.js`
11. `tools/shared/cloudRuntime.js`
12. `tools/shared/collaborationSystem.js`
13. `tools/shared/contractVersioning.js`
14. `tools/shared/devConsoleDebugOverlay.js`
15. `tools/shared/hotReloadSystem.js`
16. `tools/shared/multiTargetExport.js`
17. `tools/shared/performanceBenchmarks.js`
18. `tools/shared/platformValidationSuite.js`
19. `tools/shared/pluginArchitecture.js`
20. `tools/shared/renderPipelineContract.js`
21. `tools/shared/runtimeAssetLoader.js`
22. `tools/shared/runtimeSceneLoaderHotReload.js`
23. `tools/shared/runtimeStreaming.js`
24. `tools/shared/vectorAssetSystem.js`
25. `tools/shared/vectorGeometryRuntime.js`
26. `tools/shared/vectorNativeTemplate.js`
27. `tools/shared/vectorTemplateSampleGame.js`
28. `tools/shared/vector/vectorAssetContract.js`
29. `tools/shared/vector/vectorRenderPrep.js`

Do not edit any other file.

## Source of Truth
This exact file list comes from the provided duplicate report entry for:

`function cloneJson(value)`

No other clone/copy helpers are in scope.

## Exact Shared Helper Creation
Create:

`src/shared/utils/jsonUtils.js`

Export exactly one helper:

```js
export function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
```

Use the existing local implementation contract already present in the batch. Do not change behavior.

## Exact Consumer Changes
For each of the 28 listed consumer files:

If the file contains a local function definition matching:
```js
function cloneJson(value)
```
then:
- remove the local `cloneJson(value)` function definition
- import `cloneJson` from the correct relative path to:
  - `src/shared/utils/jsonUtils.js`
- if the file already imports from that module, add `cloneJson` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `cloneJson`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/jsonUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no game files
- no sample files
- no repo-wide clone/deep-clone cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 29 listed files changed
2. Confirm `src/shared/utils/jsonUtils.js` exists and exports only `cloneJson`
3. Confirm local `function cloneJson(value)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `cloneJson` from the correct relative path to `src/shared/utils/jsonUtils.js`
5. Confirm no engine, game, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `clone(value)`
- no cleanup of `cloneDeep(value)`
- no cleanup outside the 28 listed consumer files
- no refactor beyond this exact duplicate-removal batch
