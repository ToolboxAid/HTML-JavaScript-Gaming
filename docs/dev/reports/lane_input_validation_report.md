# Lane Input Validation Report

Generated: 2026-05-26T22:55:37.503Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
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
