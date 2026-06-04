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
2. `docs_build/dev/toolbox/devConsoleIntegration.js`
3. `docs_build/dev/toolbox/advanced/debugMacroRegistry.js`
4. `docs_build/dev/toolbox/advanced/debugPanelGroupRegistry.js`
5. `docs_build/dev/toolbox/inspectors/inspectorStore.js`
6. `docs_build/dev/toolbox/plugins/debugPluginSystem.js`
7. `docs_build/dev/toolbox/presets/debugPresetApplier.js`
8. `docs_build/dev/toolbox/presets/debugPresetRegistry.js`
9. `src/shared/toolbox/assetMarketplace.js`
10. `src/shared/toolbox/asteroidsPlatformDemo.js`
11. `src/shared/toolbox/cloudRuntime.js`
12. `src/shared/toolbox/collaborationSystem.js`
13. `src/shared/toolbox/contractVersioning.js`
14. `src/shared/toolbox/devConsoleDebugOverlay.js`
15. `src/shared/toolbox/hotReloadSystem.js`
16. `src/shared/toolbox/multiTargetExport.js`
17. `src/shared/toolbox/performanceBenchmarks.js`
18. `src/shared/toolbox/platformValidationSuite.js`
19. `src/shared/toolbox/pluginArchitecture.js`
20. `src/shared/toolbox/renderPipelineContract.js`
21. `src/shared/toolbox/runtimeAssetLoader.js`
22. `src/shared/toolbox/runtimeSceneLoaderHotReload.js`
23. `src/shared/toolbox/runtimeStreaming.js`
24. `src/shared/toolbox/vectorAssetSystem.js`
25. `src/shared/toolbox/vectorGeometryRuntime.js`
26. `src/shared/toolbox/vectorNativeTemplate.js`
27. `src/shared/toolbox/vectorTemplateSampleGame.js`
28. `src/shared/toolbox/vector/vectorAssetContract.js`
29. `src/shared/toolbox/vector/vectorRenderPrep.js`

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
