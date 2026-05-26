# Lane Input Validation Report

Generated: 2026-05-26T20:35:58.941Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
| tool-runtime | test | tests/playwright/tools/AssetManagerV2.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| tool-runtime | test | tests/playwright/tools/CollisionInspectorV2.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| tool-runtime | test | tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| tool-runtime | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-runtime | helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-runtime | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-runtime | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-runtime | fixture | games/Asteroids/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| tool-runtime | fixture | games/GravityWell/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| tool-runtime | fixture | games/Pong/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| tool-runtime | fixture | tests/fixtures/workspace-v2/uat.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| tool-runtime | import | tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-runtime | import | tests/helpers/playwrightStorageIsolation.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-runtime | import | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-runtime | import | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| game-runtime | test | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| game-runtime | test | tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| game-runtime | test | tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| game-runtime | test | tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| game-runtime | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| game-runtime | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| game-runtime | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| game-runtime | fixture | games/Asteroids/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| game-runtime | import | tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| game-runtime | import | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| game-runtime | import | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | test | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| integration | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | fixture | games/Pong/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| integration | import | tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/playwrightStorageIsolation.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | test | tests/assets/AssetLoaderSystem.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/audio/AudioService.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/core/EngineCoreBoundaryBaseline.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/core/FixedTicker.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/core/FrameClock.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/input/GamepadHapticsService.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/input/GamepadInputAdapter.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/input/InputMap.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/input/KeyboardState.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/input/MouseState.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | test | tests/render/Renderer.test.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| engine-src | import | src/engine/assets/AssetLoaderSystem.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/assets/AssetRegistry.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/assets/ImageAssetLoader.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/audio/AudioService.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/camera/Camera2D.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/camera/Camera3D.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/camera/CameraSystem.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/core/Engine.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/core/FixedTicker.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/core/FrameClock.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/core/RuntimeMetrics.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/events/EventBus.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/ActionInputService.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/GamepadHapticsService.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/GamepadInputAdapter.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/InputMap.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/InputService.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/KeyboardState.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/input/MouseState.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/physics/arcadeBody.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/physics/collision3d.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/physics/drag.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/physics/integration3d.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/physics/scene3d.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/rendering/CanvasRenderer.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/rendering/LayeredRenderSystem.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/scene/Scene.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/scene/SceneManager.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/systems/MovementSystem.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| engine-src | import | src/engine/systems/PhysicsSystem.js | PASS | Relative import dependency is resolved and recorded in the manifest. |

## Ownership Validation Failures

No manifest ownership, helper, fixture, import, or runtime command target failures.

## Fast-Fail Enforcement

- Manifest ownership is validated before Playwright/browser launch.
- Helper ownership is validated before execution.
- Fixture ownership is validated before execution.
- Unexpected discovery expansion outside manifest scope blocks runtime scheduling.
- Deterministic manifest failures do not trigger fallback broad discovery.
