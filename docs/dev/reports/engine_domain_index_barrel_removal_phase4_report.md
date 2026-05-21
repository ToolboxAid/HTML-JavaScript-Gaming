# PR_26140_070 Engine Domain Index Barrel Removal Phase 4

## Summary
- Removed the targeted phase 4 engine domain barrel files:
  - `src/engine/assets/index.js`
  - `src/engine/audio/index.js`
  - `src/engine/persistence/index.js`
  - `src/engine/release/index.js`
  - `src/engine/replay/index.js`
  - `src/engine/security/index.js`
  - `src/engine/ui/index.js`
- Replaced active imports from those barrels with direct canonical file imports.
- Kept edits import-only for consumers. No runtime logic, sample JSON, game/sample entry removal, replacement barrels, or pass-through shims were added.
- No edits were made under `src/engine/debug/**`, `src/engine/network/**`, or `src/engine/systems/**`.
- `src/engine/core/index.js` remains untouched in this PR.
- `src/engine/core/Engine.js` received required import-only updates from the audio and release barrels.
- `src/engine/release/CrashRecoveryManager.js` and `src/engine/release/SettingsSystem.js` received required import-only updates from the persistence barrel.
- `src/shared/debug/config.js` and `src/tools/common/GameManifestLoader.js` received required import-only updates so no active target barrel imports remain.

## Direct Import Mapping
- Assets:
  - `AssetRegistry` -> `src/engine/assets/AssetRegistry.js`
  - `SpriteAtlas` -> `src/engine/assets/SpriteAtlas.js`
  - `ImageAssetLoader` -> `src/engine/assets/ImageAssetLoader.js`
  - `AssetLoaderSystem` -> `src/engine/assets/AssetLoaderSystem.js`
  - `AssetOptimizer` -> `src/engine/assets/AssetOptimizer.js`
- Audio:
  - audio service/classes -> their one-class files under `src/engine/audio/`
- Persistence:
  - storage service/classes -> their one-class files under `src/engine/persistence/`
  - file read/write/download helpers -> `src/engine/persistence/FilePersistenceService.js`
  - compression helpers -> `src/engine/persistence/CompressionService.js`
  - world serialization helpers -> `src/engine/persistence/WorldSerializer.js`
- Release:
  - release service/classes -> their one-class files under `src/engine/release/`
- Replay:
  - `ReplaySystem` -> `src/engine/replay/ReplaySystem.js`
  - `ReplayTimeline` -> `src/engine/replay/ReplayTimeline.js`
  - replay model helpers -> `src/engine/replay/ReplayModel.js`
- Security:
  - security service/classes -> their one-class files under `src/engine/security/`
- UI:
  - `UIFramework` -> `src/engine/ui/UIFramework.js`
  - canvas dialog helpers -> `src/engine/ui/CanvasDialogPrimitives.js`
  - canvas popup interaction helpers -> `src/engine/ui/CanvasPopupInteractions.js`
  - canvas popup state helpers -> `src/engine/ui/CanvasPopupState.js`

## Validation
- PASS: target barrel scan reports `NO_TARGET_BARREL_IMPORTS`.
- PASS: target deletion scan confirms all seven targeted `index.js` files no longer exist.
- PASS: no JSON files changed.
- PASS: `node --check` passed for 76 changed existing JS/MJS files.
- PASS: local import target validation passed for 76 changed existing JS/MJS files.
- PASS: `npm run test:workspace-v2` passed 59/59 tests.
- PASS: targeted affected domain tests passed:
  - `tests/audio/AudioService.test.mjs`
  - `tests/core/EngineCoreBoundaryBaseline.test.mjs`
  - `tests/final/EditorAutomationSecurityPipeline.test.mjs`
  - `tests/final/FinalSystems.test.mjs`
  - `tests/final/PlatformUxSystems.test.mjs`
  - `tests/final/ReleaseReadinessSystems.test.mjs`
  - `tests/persistence/StorageService.test.mjs`
  - `tests/replay/ReplaySystem.test.mjs`
  - `tests/replay/ReplayTimeline.test.mjs`
- PASS: `git diff --check` exited 0.
- SKIPPED: full samples smoke test, per PR instruction.
