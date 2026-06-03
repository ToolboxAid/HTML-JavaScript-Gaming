# BUILD_PR_SHARED_EXTRACTION_31_CLONE_JSON_BATCH_RETRY

## Purpose
Centralize duplicated `cloneJson(value)` implementations across the exact toolbox/dev + toolbox/shared batch identified in the duplicate report, without guessing scope.

## Single PR Purpose
Normalize ONLY this helper:

- `cloneJson(value)`

## Exact Files Allowed

### New shared file
1. `src/shared/utils/jsonUtils.js`

### Consumer files
2. `toolbox/dev/devConsoleIntegration.js`
3. `toolbox/dev/advanced/debugMacroRegistry.js`
4. `toolbox/dev/advanced/debugPanelGroupRegistry.js`
5. `toolbox/dev/inspectors/inspectorStore.js`
6. `toolbox/dev/plugins/debugPluginSystem.js`
7. `toolbox/dev/presets/debugPresetApplier.js`
8. `toolbox/dev/presets/debugPresetRegistry.js`
9. `toolbox/shared/assetMarketplace.js`
10. `toolbox/shared/asteroidsPlatformDemo.js`
11. `toolbox/shared/cloudRuntime.js`
12. `toolbox/shared/collaborationSystem.js`
13. `toolbox/shared/contractVersioning.js`
14. `toolbox/shared/devConsoleDebugOverlay.js`
15. `toolbox/shared/hotReloadSystem.js`
16. `toolbox/shared/multiTargetExport.js`
17. `toolbox/shared/performanceBenchmarks.js`
18. `toolbox/shared/platformValidationSuite.js`
19. `toolbox/shared/pluginArchitecture.js`
20. `toolbox/shared/renderPipelineContract.js`
21. `toolbox/shared/runtimeAssetLoader.js`
22. `toolbox/shared/runtimeSceneLoaderHotReload.js`
23. `toolbox/shared/runtimeStreaming.js`
24. `toolbox/shared/vectorAssetSystem.js`
25. `toolbox/shared/vectorGeometryRuntime.js`
26. `toolbox/shared/vectorNativeTemplate.js`
27. `toolbox/shared/vectorTemplateSampleGame.js`
28. `toolbox/shared/vector/vectorAssetContract.js`
29. `toolbox/shared/vector/vectorRenderPrep.js`

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
