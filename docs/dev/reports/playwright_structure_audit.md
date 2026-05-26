# Playwright Structure Audit

Generated: 2026-05-26T20:35:58.891Z
Status: PASS

## Lane Directories

| Directory | Status | Reason |
| --- | --- | --- |
| tests/playwright/engine | SKIP | Scoped lane selected without Playwright spec targets; no directory enumeration was performed. |
| tests/playwright/games | PASS | Scoped discovery is limited to explicit target file(s): tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs, tests/playwright/games/AsteroidsBeatTiming.spec.mjs, tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs, tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs. |
| tests/playwright/integration | PASS | Scoped discovery is limited to explicit target file(s): tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs. |
| tests/playwright/tools | PASS | Scoped discovery is limited to explicit target file(s): tests/playwright/tools/AssetManagerV2.spec.mjs, tests/playwright/tools/CollisionInspectorV2.spec.mjs, tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs. |

## Blocking Findings

No blocking structural findings.

## Placement Corrections

| Previous Path | Current Path | Status | Reason |
| --- | --- | --- | --- |
| tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | Asteroids runtime/background behavior is game-owned. |
| tests/playwright/tools/AsteroidsBeatTiming.spec.mjs | tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | Asteroids beat cadence behavior is game-owned. |
| tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs | tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | Asteroids scene diagnostics behavior is game-owned. |
| tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs | tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | Asteroids ship visual runtime behavior is game-owned. |
| tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | PASS | Game index and page manifest handoff is integration-owned. |

## Documented Game Fixtures

| Lane | File | Referenced Game Fixture(s) | Reason |
| --- | --- | --- | --- |
| tools | tests/playwright/tools/AssetManagerV2.spec.mjs | Asteroids, GravityWell, Pong | Tool runtime validation uses repo/game manifests as explicit asset payload fixtures. |
| tools | tests/playwright/tools/CollisionInspectorV2.spec.mjs | Asteroids | Tool runtime validation uses game manifests as explicit collision payload fixtures. |
| integration | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | Pong | Integration validation uses Pong as an explicit cross-surface manifest handoff fixture. |

## Import Targets

| File | Status | Missing Relative Imports |
| --- | --- | --- |
| tests/playwright/tools/AssetManagerV2.spec.mjs | PASS | none |
| tests/playwright/tools/CollisionInspectorV2.spec.mjs | PASS | none |
| tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | PASS | none |
| tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | none |
| tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | none |
| tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | none |
| tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | none |
| tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | PASS | none |
| tests/helpers/playwrightRepoServer.mjs | PASS | none |
| tests/helpers/playwrightStorageIsolation.mjs | PASS | none |
| tests/helpers/playwrightV8CoverageReporter.mjs | PASS | none |
| tests/helpers/workspaceV2CoverageReporter.mjs | PASS | none |

## Intentionally Shared Helpers

| File | Reason |
| --- | --- |
| tests/helpers/playwrightRepoServer.mjs | Shared HTTP repo fixture used by tool, game, and integration Playwright suites. |
| tests/helpers/playwrightStorageIsolation.mjs | Shared localStorage/sessionStorage cleanup helper used before targeted Playwright tests. |
| tests/helpers/workspaceV2CoverageReporter.mjs | Shared V8 coverage collection for Workspace V2 and impacted browser runtime suites. |

## Fast-Fail Rules Checked

- Playwright specs must live under tools, games, integration, or engine lane directories.
- Game-specific specs are prohibited under tests/playwright/tools.
- Cross-surface tests belong under tests/playwright/integration.
- Shared helper filenames must not use game-specific names.
- Relative imports must resolve before browser lanes execute.
- Lane execution should stop before expensive Playwright runs when this audit reports blocking findings.
