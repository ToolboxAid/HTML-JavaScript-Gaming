# Src Shared Toolbox Import Fix

## Summary

- Audited only `src/shared/toolbox` for imports containing `../../src/`.
- Corrected broken imports from files already under `src/shared/toolbox` so they no longer route through `../../src/`.
- Did not modify imports under `tests/`.
- Did not move files, rename files, change Toolbox UI, change Theme V2, or alter tool naming.

## Changed Import Paths

- `src/shared/toolbox/runtimeAssetLoader.js`
  - `../../src/engine/assets/AssetRegistry.js` -> `../../engine/assets/AssetRegistry.js`
  - `../../src/engine/assets/AssetLoaderSystem.js` -> `../../engine/assets/AssetLoaderSystem.js`
  - `../../src/engine/assets/ImageAssetLoader.js` -> `../../engine/assets/ImageAssetLoader.js`
- `src/shared/toolbox/runtimeStreaming.js`
  - `../../src/engine/assets/AssetRegistry.js` -> `../../engine/assets/AssetRegistry.js`
  - `../../src/engine/assets/AssetLoaderSystem.js` -> `../../engine/assets/AssetLoaderSystem.js`
  - `../../src/engine/assets/ImageAssetLoader.js` -> `../../engine/assets/ImageAssetLoader.js`
- `src/shared/toolbox/assetUsageIntegration.js`
  - `../../src/engine/persistence/LocalStorageService.js` -> `../../engine/persistence/LocalStorageService.js`
- `src/shared/toolbox/devConsoleDebugOverlay.js`
  - `../../src/engine/debug/inspectors/shared/inspectorUtils.js` -> `../../engine/debug/inspectors/shared/inspectorUtils.js`
- `src/shared/toolbox/documentModeGuards.js`
  - `../../src/engine/persistence/LocalStorageService.js` -> `../../engine/persistence/LocalStorageService.js`
  - `../../src/engine/persistence/SessionStorageService.js` -> `../../engine/persistence/SessionStorageService.js`
- `src/shared/toolbox/platformShell.js`
  - `../../src/engine/logging/Logger.js` -> `../../engine/logging/Logger.js`
  - `../../src/engine/persistence/LocalStorageService.js` -> `../../engine/persistence/LocalStorageService.js`
  - `../../src/engine/persistence/SessionStorageService.js` -> `../../engine/persistence/SessionStorageService.js`
  - `../../src/engine/runtime/RuntimeMonitoringHooks.js` -> `../../engine/runtime/RuntimeMonitoringHooks.js`
- `src/shared/toolbox/projectSystem.js`
  - `../../src/engine/persistence/FilePersistenceService.js` -> `../../engine/persistence/FilePersistenceService.js`
- `src/shared/toolbox/toolHostSharedContext.js`
  - `../../src/engine/persistence/LocalStorageService.js` -> `../../engine/persistence/LocalStorageService.js`
  - `../../src/engine/persistence/SessionStorageService.js` -> `../../engine/persistence/SessionStorageService.js`
- `src/shared/toolbox/toolLaunchSSoT.js`
  - `../../src/engine/persistence/LocalStorageService.js` -> `../../engine/persistence/LocalStorageService.js`
  - `../../src/engine/persistence/SessionStorageService.js` -> `../../engine/persistence/SessionStorageService.js`

## Audit Results

- `rg -n "\.\./\.\./src/" src/shared/toolbox`: PASS, no matches remain.
- `../../src/shared/...` was checked under `src/shared/toolbox`; no matches were present.
- Test imports under `tests/` were intentionally left unchanged.

## Targeted Validation

- `RuntimeAssetLoader`: PASS.
- `RuntimeStreamingSystem`: PASS.
- `DevConsoleDebugOverlay`: PASS.
- `AssetUsageIntegration`: FAILS after successful module import on an existing behavior assertion:
  - actual `#`
  - expected `../palette-manager-v2/index.html?sourceToolId=sprite-editor`
  - The failure is outside this PR scope because the requested change is import-path-only and the assertion targets old Palette Manager routing behavior.
- `git diff --check`: PASS.

## Playwright Impact

- Playwright impacted: No.
- No Playwright tests were run because this PR only fixes shared module import paths.
