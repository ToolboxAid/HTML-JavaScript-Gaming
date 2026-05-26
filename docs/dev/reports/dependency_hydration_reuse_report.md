# Dependency Hydration Reuse Report

Generated: 2026-05-26T20:47:41.393Z
Status: PASS

## Summary

Reused dependency hydration: 4
Invalidated dependency hydration: 0
Generated dependency hydration: 0
Prevented dependency graph hydration: 4
Prevented helper resolution passes: 11
Prevented fixture ownership traversal: 6

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | REUSED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json; games/GravityWell/game.manifest.json; games/Pong/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 0fecfc07e559cf38 | Dependency hydration reused from validated warm-start state. |
| game-runtime | REUSED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 1e6d53ee82652bb2 | Dependency hydration reused from validated warm-start state. |
| integration | REUSED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | a26bcd0115fc4315 | Dependency hydration reused from validated warm-start state. |
| engine-src | REUSED | none | none | src/engine/assets/AssetLoaderSystem.js; src/engine/assets/AssetRegistry.js; src/engine/assets/ImageAssetLoader.js; src/engine/audio/AudioService.js; src/engine/camera/Camera2D.js; src/engine/camera/Camera3D.js; src/engine/camera/CameraSystem.js; src/engine/core/Engine.js; src/engine/core/FixedTicker.js; src/engine/core/FrameClock.js; src/engine/core/RuntimeMetrics.js; src/engine/events/EventBus.js; src/engine/input/ActionInputService.js; src/engine/input/GamepadHapticsService.js; src/engine/input/GamepadInputAdapter.js; src/engine/input/InputMap.js; src/engine/input/InputService.js; src/engine/input/KeyboardState.js; src/engine/input/MouseState.js; src/engine/physics/arcadeBody.js; src/engine/physics/collision3d.js; src/engine/physics/drag.js; src/engine/physics/integration3d.js; src/engine/physics/scene3d.js; src/engine/rendering/CanvasRenderer.js; src/engine/rendering/LayeredRenderSystem.js; src/engine/scene/Scene.js; src/engine/scene/SceneManager.js; src/engine/systems/MovementSystem.js; src/engine/systems/PhysicsSystem.js | e13166ce3ced2d3e | Dependency hydration reused from validated warm-start state. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
