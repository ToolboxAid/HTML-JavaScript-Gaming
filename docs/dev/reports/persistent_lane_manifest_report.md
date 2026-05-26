# Persistent Lane Manifest Report

Generated: 2026-05-26T21:43:06.650Z
Status: PASS
Manifest directory: docs/dev/reports/lane_manifests

## Summary

Reused manifests: 4
Invalidated manifests: 0
Generated manifests: 0
Prevented discovery scans: 4

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| tool-runtime | REUSED | docs/dev/reports/lane_manifests/tool-runtime.json | b3f312619ab75947 | ade0c4104a98fa3b | Inputs unchanged; persisted lane manifest reused. |
| game-runtime | REUSED | docs/dev/reports/lane_manifests/game-runtime.json | 62800e71c1b48b0e | 5e04fc3c8d91a8c5 | Inputs unchanged; persisted lane manifest reused. |
| integration | REUSED | docs/dev/reports/lane_manifests/integration.json | c2f678b64e5eba43 | 892306a4a4fbec1d | Inputs unchanged; persisted lane manifest reused. |
| engine-src | REUSED | docs/dev/reports/lane_manifests/engine-src.json | ed506a1f72c78a8a | b08a629e4c7cb2e0 | Inputs unchanged; persisted lane manifest reused. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | tools | persistent | tests/playwright/tools/AssetManagerV2.spec.mjs; tests/playwright/tools/CollisionInspectorV2.spec.mjs; tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json; games/GravityWell/game.manifest.json; games/Pong/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | 4138c2ded15059b2 | ade0c4104a98fa3b |
| game-runtime | games | persistent | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs; tests/playwright/games/AsteroidsBeatTiming.spec.mjs; tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs; tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json | e6ec9fe53535987b | 5e04fc3c8d91a8c5 |
| integration | integration | persistent | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | 4138c2ded15059b2 | 892306a4a4fbec1d |
| engine-src | engine | persistent | tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FixedTicker.test.mjs; tests/core/FrameClock.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/render/Renderer.test.mjs | none | none | e2570ebce03c46e3 | b08a629e4c7cb2e0 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
