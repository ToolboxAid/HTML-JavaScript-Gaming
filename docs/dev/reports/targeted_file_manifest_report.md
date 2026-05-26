# Targeted File Manifest Report

Generated: 2026-05-26T22:55:37.502Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| engine-src | engine | PASS | generated | tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FixedTicker.test.mjs; tests/core/FrameClock.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/render/Renderer.test.mjs | none | none | src/engine/assets/AssetLoaderSystem.js; src/engine/assets/AssetRegistry.js; src/engine/assets/ImageAssetLoader.js; src/engine/audio/AudioService.js; src/engine/camera/Camera2D.js; src/engine/camera/Camera3D.js; src/engine/camera/CameraSystem.js; src/engine/core/Engine.js; src/engine/core/FixedTicker.js; src/engine/core/FrameClock.js; src/engine/core/RuntimeMetrics.js; src/engine/events/EventBus.js; src/engine/input/ActionInputService.js; src/engine/input/GamepadHapticsService.js; src/engine/input/GamepadInputAdapter.js; src/engine/input/InputMap.js; src/engine/input/InputService.js; src/engine/input/KeyboardState.js; src/engine/input/MouseState.js; src/engine/physics/arcadeBody.js; src/engine/physics/collision3d.js; src/engine/physics/drag.js; src/engine/physics/integration3d.js; src/engine/physics/scene3d.js; src/engine/rendering/CanvasRenderer.js; src/engine/rendering/LayeredRenderSystem.js; src/engine/scene/Scene.js; src/engine/scene/SceneManager.js; src/engine/systems/MovementSystem.js; src/engine/systems/PhysicsSystem.js | e2570ebce03c46e3 | 1b10dc27feffaf1f | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 10
Targeted file/helper reads: 11

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
