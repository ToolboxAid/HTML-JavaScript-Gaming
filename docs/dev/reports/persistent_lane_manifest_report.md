# Persistent Lane Manifest Report

Generated: 2026-05-26T20:05:20.958Z
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
| tool-runtime | REUSED | docs/dev/reports/lane_manifests/tool-runtime.json | 294a571cec509e5f | 999cd821c911cac6 | Inputs unchanged; persisted lane manifest reused. |
| game-runtime | REUSED | docs/dev/reports/lane_manifests/game-runtime.json | 1f19b05ab0983a84 | 6b3ea783bd50d09f | Inputs unchanged; persisted lane manifest reused. |
| integration | REUSED | docs/dev/reports/lane_manifests/integration.json | 5d0da6db61d73d19 | a0a414fdcda4d881 | Inputs unchanged; persisted lane manifest reused. |
| engine-src | REUSED | docs/dev/reports/lane_manifests/engine-src.json | 0f5dac5319ea6241 | 4b09c904c7f073c7 | Inputs unchanged; persisted lane manifest reused. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | tools | persistent | tests/playwright/tools/AssetManagerV2.spec.mjs; tests/playwright/tools/CollisionInspectorV2.spec.mjs; tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json; games/GravityWell/game.manifest.json; games/Pong/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | 4138c2ded15059b2 | 999cd821c911cac6 |
| game-runtime | games | persistent | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs; tests/playwright/games/AsteroidsBeatTiming.spec.mjs; tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs; tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Asteroids/game.manifest.json | e6ec9fe53535987b | 6b3ea783bd50d09f |
| integration | integration | persistent | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | 4138c2ded15059b2 | a0a414fdcda4d881 |
| engine-src | engine | persistent | tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FixedTicker.test.mjs; tests/core/FrameClock.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/render/Renderer.test.mjs | none | none | e2570ebce03c46e3 | 4b09c904c7f073c7 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
