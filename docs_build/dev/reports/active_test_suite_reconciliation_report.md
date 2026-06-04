# PR_26154_032 Active Test Suite Reconciliation

Baseline used: latest applied root/theme/toolbox migration state after `PR_26154_031-toolbox-template-mismatch-closeout`.

## Scope

- Classified active test entry points, fixtures, helpers, and Playwright folders.
- Removed tests that only targeted deprecated `old-tools`, `old_games`, `old_samples`, removed `tools/`, removed `samples/`, or removed legacy V2 tool folders.
- Rewired active test lane metadata only where the intended active target was clear.
- Kept root `package.json` in place.

## Active

- `tests/run-tests.mjs`: active explicit Node test runner after deprecated-only entries were removed.
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`: active toolbox/root future-state Playwright coverage.
- `tests/helpers/playwrightRepoServer.mjs`: active shared Playwright server fixture.
- `tests/helpers/playwrightStorageIsolation.mjs`: active shared Playwright storage fixture.
- `tests/helpers/workspaceV2CoverageReporter.mjs`: active Workspace V2 coverage helper.
- `tests/helpers/playwrightV8CoverageReporter.mjs`: active V8 coverage helper, updated to current `toolbox/` and `assets/theme-v2/` entry points.
- `tests/tools/*.test.mjs` files still imported by `tests/run-tests.mjs`: active engine/tool contract coverage unless noted as ambiguous below.

## Rewired

| File | Change | Reason |
| --- | --- | --- |
| `tests/run-tests.mjs` | Removed deprecated-only test imports and runner entries. | The removed tests targeted old tool/sample/template contracts. |
| `scripts/run-targeted-test-lanes.mjs` | Pointed `tool-runtime` to `tests/playwright/tools/RootToolsFutureState.spec.mjs`. | Keeps the active toolbox lane current. |
| `scripts/run-targeted-test-lanes.mjs` | Removed stale integration Playwright lane commands and discovery targets. | The integration specs only validated old tool/sample launch surfaces. |
| `scripts/audit-playwright-test-locations.mjs` | Removed deprecated Playwright tool ownership names and old fixture mappings. | Prevents deleted V2/old tool specs from remaining required locations. |
| `tests/helpers/playwrightV8CoverageReporter.mjs` | Updated format entry points to `toolbox/`, `toolbox/_tool_template-v2/`, and `assets/theme-v2/js/`. | Aligns coverage summaries with the current root structure. |

## Deleted Deprecated-Only Tests

Removed `61` deprecated-only test files:

- `tests/games/GravityValidation.test.mjs`
- `tests/games/GravityWorld.test.mjs`
- `tests/games/MultiBallChaosValidation.test.mjs`
- `tests/games/MultiBallChaosWorld.test.mjs`
- `tests/games/PacmanLiteValidation.test.mjs`
- `tests/games/PacmanLiteWorld.test.mjs`
- `tests/games/PaddleInterceptValidation.test.mjs`
- `tests/games/PaddleInterceptWorld.test.mjs`
- `tests/games/ThrusterValidation.test.mjs`
- `tests/games/ThrusterWorld.test.mjs`
- `tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs`
- `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs`
- `tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs`
- `tests/playwright/tools/AssetManagerV2.spec.mjs`
- `tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs`
- `tests/playwright/tools/PaletteManagerV2Coverage.spec.mjs`
- `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`
- `tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tests/runtime/Phase16AdvancedBatch1Sanity.test.mjs`
- `tests/runtime/Phase16AdvancedBatch2Sanity.test.mjs`
- `tests/runtime/Phase16AdvancedBatch3Sanity.test.mjs`
- `tests/runtime/Phase16AdvancedBatch4Sanity.test.mjs`
- `tests/runtime/Phase16AdvancedBatch5Sanity.test.mjs`
- `tests/runtime/Phase16RenderingAnimationTrackSanity.test.mjs`
- `tests/runtime/Phase16VisibilitySanity.test.mjs`
- `tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs`
- `tests/runtime/Phase17OverlayDiagnosticsTooling.test.mjs`
- `tests/runtime/Phase17OverlayExpansionFramework.test.mjs`
- `tests/runtime/Phase17OverlayGameplayRuntimeIntegration.test.mjs`
- `tests/runtime/Phase17OverlayInputEdgeCases.test.mjs`
- `tests/runtime/Phase17OverlayMultiLayerComposition.test.mjs`
- `tests/runtime/Phase17RealGameplaySample.test.mjs`
- `tests/runtime/Phase17RenderingTechniqueExpansionSanity.test.mjs`
- `tests/runtime/Phase17Sample1709MovementModelsLab.test.mjs`
- `tests/runtime/Phase17Sample1712GameplayMetricsTelemetry.test.mjs`
- `tests/runtime/Phase17Sample1713FinalReferenceGame.test.mjs`
- `tests/runtime/Phase17TabDebugOverlayCycle1707Plus.test.mjs`
- `tests/runtime/Phase18CoreServicesSkeleton.test.mjs`
- `tests/runtime/Phase18IntegrationFlowPass.test.mjs`
- `tests/runtime/Phase18RuntimeLayerScaffold.test.mjs`
- `tests/runtime/Phase19CoreServicesSkeleton.test.mjs`
- `tests/runtime/Phase19IntegrationFlowPass.test.mjs`
- `tests/runtime/Phase19OverlayExpansionFramework.test.mjs`
- `tests/runtime/Phase19OverlayPluginRegistry.test.mjs`
- `tests/runtime/Phase19RuntimeLayerScaffold.test.mjs`
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- `tests/runtime/V2ToolSmoke.test.mjs`
- `tests/samples/FullscreenAbility0713ViewportFit.test.mjs`
- `tests/samples/OrbitLabModel.test.mjs`
- `tests/samples/OrbitLabScene.test.mjs`
- `tests/samples/ProjectileLabModel.test.mjs`
- `tests/samples/ProjectileLabScene.test.mjs`
- `tests/samples/SamplesProgramCombinedPass.test.mjs`
- `tests/tools/ToolEntryLaunchContract.test.mjs`
- `tests/tools/ToolLocalSampleMigration.test.mjs`
- `tests/tools/ToolSchemaStrictModeValidation.test.mjs`
- `tests/tools/ToolsIndexRegistrySmoke.test.mjs`
- `tests/tools/VectorTemplateSampleGame.test.mjs`

## Ambiguous / Retained

- `tests/final/ReleaseReadinessSystems.test.mjs` retains `old_samples/shared/theme.css` as a string fixture for packager deduplication behavior; it is not a deprecated sample runtime test.
- Active contract tests that assert paths are not `samples/` or `GameFoundryStudio/` were retained because they enforce current boundaries.
- `tests/validation/samples.*.json` remains as historical validation fixture data. It is not invoked by the removed samples tests.
- `tests/fixtures/v2-tools/` remains as ambiguous fixture inventory because this PR only deleted deprecated-only tests, not fixture archives.

## Validation

- PASS direct removed-samples import/route scan in active tests.
- PASS stale deleted-spec-name scan; only a historical roadmap line mentions `SamplesProgramCombinedPass`.
- PASS changed JavaScript syntax checks.
- PASS `npm run test:playwright:static`.
- PASS `npm run test:workspace-v2`.
- SKIPPED tests against `old-tools/`, `old_games`, and `old_samples` per request.
