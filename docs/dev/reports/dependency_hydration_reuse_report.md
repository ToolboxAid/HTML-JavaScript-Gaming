# Dependency Hydration Reuse Report

Generated: 2026-05-26T22:55:37.502Z
Status: PASS

## Summary

Reused dependency hydration: 0
Invalidated dependency hydration: 1
Generated dependency hydration: 0
Prevented dependency graph hydration: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| engine-src | INVALIDATED | none | none | src/engine/assets/AssetLoaderSystem.js; src/engine/assets/AssetRegistry.js; src/engine/assets/ImageAssetLoader.js; src/engine/audio/AudioService.js; src/engine/camera/Camera2D.js; src/engine/camera/Camera3D.js; src/engine/camera/CameraSystem.js; src/engine/core/Engine.js; src/engine/core/FixedTicker.js; src/engine/core/FrameClock.js; src/engine/core/RuntimeMetrics.js; src/engine/events/EventBus.js; src/engine/input/ActionInputService.js; src/engine/input/GamepadHapticsService.js; src/engine/input/GamepadInputAdapter.js; src/engine/input/InputMap.js; src/engine/input/InputService.js; src/engine/input/KeyboardState.js; src/engine/input/MouseState.js; src/engine/physics/arcadeBody.js; src/engine/physics/collision3d.js; src/engine/physics/drag.js; src/engine/physics/integration3d.js; src/engine/physics/scene3d.js; src/engine/rendering/CanvasRenderer.js; src/engine/rendering/LayeredRenderSystem.js; src/engine/scene/Scene.js; src/engine/scene/SceneManager.js; src/engine/systems/MovementSystem.js; src/engine/systems/PhysicsSystem.js | e13166ce3ced2d3e | Dependency hydration was refreshed after warm-start invalidation. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
