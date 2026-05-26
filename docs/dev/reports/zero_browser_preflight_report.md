# Zero-Browser Preflight Report

Generated: 2026-05-26T20:35:58.941Z
Status: PASS

## Prevented Browser Launches

Count: 0
Reason: No deterministic pre-runtime failures were found.

## Deterministic Failures Caught Pre-Runtime

No deterministic setup failures.

## Validation Coverage

| Check | Status | Details |
| --- | --- | --- |
| lane ownership | PASS | Playwright structure audit passed. |
| directory placement | PASS | tools/games/integration/engine ownership checked. |
| invalid file naming | PASS | Game-specific filenames are blocked from generic reusable lanes. |
| duplicate registrations | PASS | No duplicate lane registrations. |
| invalid imports | PASS | Relative imports checked by Playwright structure audit. |
| unresolved fixtures | PASS | No unresolved fixture findings. |
| unresolved helpers | PASS | Shared helper imports and naming ownership checked. |
| targeted file manifests | PASS | tool-runtime:PASS, game-runtime:PASS, integration:PASS, engine-src:PASS |
| persistent lane manifests | PASS | tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED |
| lane warm-start reuse | PASS | tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED |
| dependency hydration reuse | PASS | tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED |
| manifest input graph expansion | PASS | No scoped discovery inputs escaped manifest ownership. |
| scoped discovery | PASS | Targets: tests/assets/AssetLoaderSystem.test.mjs, tests/audio/AudioService.test.mjs, tests/core/EngineCoreBoundaryBaseline.test.mjs, tests/core/FixedTicker.test.mjs, tests/core/FrameClock.test.mjs, tests/input/GamepadHapticsService.test.mjs, tests/input/GamepadInputAdapter.test.mjs, tests/input/InputMap.test.mjs, tests/input/KeyboardState.test.mjs, tests/input/MouseState.test.mjs, tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs, tests/playwright/games/AsteroidsBeatTiming.spec.mjs, tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs, tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs, tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs, tests/playwright/tools/AssetManagerV2.spec.mjs, tests/playwright/tools/CollisionInspectorV2.spec.mjs, tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs, tests/render/Renderer.test.mjs; helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs. |
| invalid grep patterns | PASS | No invalid grep patterns. |
| Windows quoting hazards | PASS | Lane tool-runtime grep pattern is passed as a literal Node argv value: launch guard|temporary UAT context|rejects non-Workspace |
| invalid lane references | PASS | No invalid lane references. |
| invalid lane configuration | PASS | See docs/dev/reports/lane_compilation_report.md. |
| deterministic dependency graph | PASS | See docs/dev/reports/dependency_gating_report.md. |
| conflicting reusable helper ownership | PASS | Shared helper filenames checked against known game names. |

## Corrected Ownership Drift

- Asteroids Playwright runtime specs are enforced under `tests/playwright/games`.
- Game index preview manifest handoff is enforced under `tests/playwright/integration`.
- Tool-owned specs may reference games only as documented explicit fixtures.

## Runtime Savings Observations

- This preflight runs through Node-only validation before Playwright CLI startup.
- Browser launch is blocked on deterministic setup failure.
- Workspace V2, broad lane scheduling, and samples smoke are not started by preflight.
- Invalid targeted lane setup cannot escalate into full-lane reruns.
