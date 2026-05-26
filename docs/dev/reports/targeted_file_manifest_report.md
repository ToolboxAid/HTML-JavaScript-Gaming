# Targeted File Manifest Report

Generated: 2026-05-26T19:54:13.477Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Tests | Helpers | Fixtures | Imports / Dependencies | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | tools | PASS | tests/playwright/tools/AssetManagerV2.spec.mjs; tests/playwright/tools/CollisionInspectorV2.spec.mjs; tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json; games/GravityWell/game.manifest.json; games/Pong/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 199a0e6b2bc6757e | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |
| game-runtime | games | PASS | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs; tests/playwright/games/AsteroidsBeatTiming.spec.mjs; tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs; tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 4b71d862c883a223 | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |
| integration | integration | PASS | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | ad9f823dff6bab01 | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |
| engine-src | engine | PASS | tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FixedTicker.test.mjs; tests/core/FrameClock.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/render/Renderer.test.mjs | none | none | src/engine/assets/AssetLoaderSystem.js; src/engine/assets/AssetRegistry.js; src/engine/assets/ImageAssetLoader.js; src/engine/audio/AudioService.js; src/engine/camera/Camera2D.js; src/engine/camera/Camera3D.js; src/engine/camera/CameraSystem.js; src/engine/core/Engine.js; src/engine/core/FixedTicker.js; src/engine/core/FrameClock.js; src/engine/core/RuntimeMetrics.js; src/engine/events/EventBus.js; src/engine/input/ActionInputService.js; src/engine/input/GamepadHapticsService.js; src/engine/input/GamepadInputAdapter.js; src/engine/input/InputMap.js; src/engine/input/InputService.js; src/engine/input/KeyboardState.js; src/engine/input/MouseState.js; src/engine/physics/arcadeBody.js; src/engine/physics/collision3d.js; src/engine/physics/drag.js; src/engine/physics/integration3d.js; src/engine/physics/scene3d.js; src/engine/rendering/CanvasRenderer.js; src/engine/rendering/LayeredRenderSystem.js; src/engine/scene/Scene.js; src/engine/scene/SceneManager.js; src/engine/systems/MovementSystem.js; src/engine/systems/PhysicsSystem.js | 164e9a265ed73abc | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 19
Targeted file/helper reads: 23

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
