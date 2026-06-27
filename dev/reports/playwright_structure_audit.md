# Playwright Structure Audit

Generated: 2026-06-27T19:31:16.106Z
Status: PASS

## Lane Directories

| Directory | Status | Reason |
| --- | --- | --- |
| dev/tests/playwright/account | PASS | Directory is an allowed Playwright lane ownership bucket. |
| dev/tests/playwright/games | PASS | Directory is an allowed Playwright lane ownership bucket. |
| dev/tests/playwright/tools | PASS | Directory is an allowed Playwright lane ownership bucket. |
| dev/tests/playwright/engine | SKIP | No Playwright specs are currently present; this lane may be empty. |
| dev/tests/playwright/integration | SKIP | No Playwright specs are currently present; this lane may be empty. |

## Blocking Findings

No blocking structural findings.

## Placement Corrections

| Previous Path | Current Path | Status | Reason |
| --- | --- | --- | --- |
| dev/tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs | dev/tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | Asteroids runtime/background behavior is game-owned. |
| dev/tests/playwright/tools/AsteroidsBeatTiming.spec.mjs | dev/tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | Asteroids beat cadence behavior is game-owned. |
| dev/tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs | dev/tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | Asteroids scene diagnostics behavior is game-owned. |
| dev/tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs | dev/tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | Asteroids ship visual runtime behavior is game-owned. |

## Documented Game Fixtures

| Lane | File | Referenced Game Fixture(s) | Reason |
| --- | --- | --- | --- |
| none | none | none | No Playwright lane uses game fixtures. |

## Import Targets

| File | Status | Missing Relative Imports |
| --- | --- | --- |
| dev/tests/playwright/tools/AdminDbViewer.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AdminHealthOperationsPage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AdminInvitationsNavPage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AdminNotesLocalViewer.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs | PASS | none |
| dev/tests/playwright/tools/AssetToolMockRepository.spec.mjs | PASS | none |
| dev/tests/playwright/tools/BrowserApiUrlConfig.spec.mjs | PASS | none |
| dev/tests/playwright/tools/BuildPathProgressSimplification.spec.mjs | PASS | none |
| dev/tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/EventsTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/GameConfigurationApiBehavior.spec.mjs | PASS | none |
| dev/tests/playwright/tools/GameCrewFoundation.spec.mjs | PASS | none |
| dev/tests/playwright/tools/GameDesignApiBehavior.spec.mjs | PASS | none |
| dev/tests/playwright/tools/GameHubMockRepository.spec.mjs | PASS | none |
| dev/tests/playwright/tools/GameJourneyTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/HitboxesTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs | PASS | none |
| dev/tests/playwright/tools/InputMappingV2Tool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/LoginSessionMode.spec.mjs | PASS | none |
| dev/tests/playwright/tools/MessagesTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ObjectsTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/OwnerAiCreditsPage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/OwnerMembershipsPage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/PaletteToolMockRepository.spec.mjs | PASS | none |
| dev/tests/playwright/tools/PublicMarketplacePage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/PublicMembershipsPage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/RemainingLegalPages.spec.mjs | PASS | none |
| dev/tests/playwright/tools/RootToolsFutureState.spec.mjs | PASS | none |
| dev/tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs | PASS | none |
| dev/tests/playwright/tools/TagsTool.spec.mjs | PASS | none |
| dev/tests/playwright/tools/TermsOfServicePage.spec.mjs | PASS | none |
| dev/tests/playwright/tools/TextToSpeechFunctional.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolboxRoutePages.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolImageRegistry.spec.mjs | PASS | none |
| dev/tests/playwright/tools/ToolNavigationPrevNext.spec.mjs | PASS | none |
| dev/tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | none |
| dev/tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | none |
| dev/tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | none |
| dev/tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | none |
| dev/tests/helpers/browserExtensionNoise.mjs | PASS | none |
| dev/tests/helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs | PASS | none |
| dev/tests/helpers/messagesPostgresClientStub.mjs | PASS | none |
| dev/tests/helpers/playwrightCtrlTapClick.mjs | PASS | none |
| dev/tests/helpers/playwrightRepoServer.mjs | PASS | none |
| dev/tests/helpers/playwrightStorageIsolation.mjs | PASS | none |
| dev/tests/helpers/playwrightV8CoverageReporter.mjs | PASS | none |
| dev/tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs | PASS | none |
| dev/tests/helpers/testCoverageCatalog.mjs | PASS | none |
| dev/tests/helpers/toolFormControlAssertions.mjs | PASS | none |
| dev/tests/helpers/workspaceV2CoverageReporter.mjs | PASS | none |

## Intentionally Shared Helpers

| File | Reason |
| --- | --- |
| dev/tests/helpers/playwrightRepoServer.mjs | Shared HTTP repo fixture used by tool, game, and integration Playwright suites. |
| dev/tests/helpers/playwrightStorageIsolation.mjs | Shared localStorage/sessionStorage cleanup helper used before targeted Playwright tests. |
| dev/tests/helpers/workspaceV2CoverageReporter.mjs | Shared V8 coverage collection for Workspace V2 and impacted browser runtime suites. |

## Fast-Fail Rules Checked

- Playwright specs must live under tools, games, integration, or engine lane directories.
- Game-specific specs are prohibited under dev/tests/playwright/tools.
- Cross-surface tests belong under dev/tests/playwright/integration.
- Shared helper filenames must not use game-specific names.
- Relative imports must resolve before browser lanes execute.
- Lane execution should stop before expensive Playwright runs when this audit reports blocking findings.
