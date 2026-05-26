# Playwright Discovery Ownership Report

Generated: 2026-05-26T22:20:10.282Z
Status: PASS

## Discovery-Time Ownership

| File | Lane Requested | Detected Ownership | Expected Location | Lane Blocked | Status | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| tests/playwright/tools/AssetManagerV2.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: AssetManagerV2 |
| tests/playwright/tools/CollisionInspectorV2.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: CollisionInspectorV2 |
| tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: ObjectVectorStudioV2 |
| tests/playwright/tools/PaletteManagerV2Coverage.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: PaletteManagerV2 |
| tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: PreviewGeneratorV2 |
| tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tools lane location |
| tests/playwright/tools/WorkspaceManagerV2.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: WorkspaceManagerV2 |
| tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | games | games | tests/playwright/games | none | PASS | game-specific filename: Asteroids |
| tests/playwright/games/AsteroidsBeatTiming.spec.mjs | games | games | tests/playwright/games | none | PASS | game-specific filename: Asteroids |
| tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | games | games | tests/playwright/games | none | PASS | game-specific filename: Asteroids |
| tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | games | games | tests/playwright/games | none | PASS | game-specific filename: Asteroids |
| tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs | integration | integration | tests/playwright/integration | none | PASS | integration filename marker: GameIndex |
| tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | integration | integration | tests/playwright/integration | none | PASS | integration filename marker: GameIndex, ManifestResolution |
| tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs | integration | integration | tests/playwright/integration | none | PASS | integration lane location |

## Shared Helper Naming

| File | Detected Ownership | Expected Location | Status | Reason |
| --- | --- | --- | --- | --- |
| tests/helpers/playwrightCtrlTapClick.mjs | shared | tests/helpers | PASS | Generic shared helper name. |
| tests/helpers/playwrightRepoServer.mjs | shared | tests/helpers | PASS | Intentionally shared helper is documented. |
| tests/helpers/playwrightStorageIsolation.mjs | shared | tests/helpers | PASS | Intentionally shared helper is documented. |
| tests/helpers/playwrightV8CoverageReporter.mjs | shared | tests/helpers | PASS | Generic shared helper name. |
| tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs | shared | tests/helpers | PASS | Generic shared helper name. |
| tests/helpers/testCoverageCatalog.mjs | shared | tests/helpers | PASS | Generic shared helper name. |
| tests/helpers/workspaceV2CoverageReporter.mjs | shared | tests/helpers | PASS | Intentionally shared helper is documented. |

## Blocking Findings

No discovery ownership blockers. Targeted Playwright lanes may be scheduled.

## Execution Guard

- Discovery ownership validation runs before lane scheduling and browser startup.
- Tool lanes reject game-owned, integration-owned, and engine-owned Playwright files.
- Game lanes reject tool-owned, integration-owned, and engine-owned Playwright files.
- Integration-only files are blocked from targeted tool/game lanes.
- Engine/src Playwright files are blocked from tool/game lanes unless the lane explicitly owns them.
- Ownership failures do not trigger fallback lanes or broad reruns.
