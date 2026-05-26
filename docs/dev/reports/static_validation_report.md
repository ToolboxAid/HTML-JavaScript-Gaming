# Static Validation Report

Generated: 2026-05-26T21:43:06.638Z
Status: PASS
Static only: No
Dry run: No

## Requested Lanes

- tool-runtime
- game-runtime
- integration
- engine-src

## Prevented Launches

Count: 0
Reason: No deterministic static validation failure was found.

## Checks

| Check | Status | Details |
| --- | --- | --- |
| lane ownership and file placement | PASS | Playwright structure audit passed. |
| invalid filename detection | PASS | Covered by Playwright structure audit. |
| missing import detection | PASS | Covered by Playwright structure audit relative import checks. |
| missing fixture detection | PASS | No missing fixture findings. |
| targeted file manifests | PASS | tool-runtime:ade0c4104a98fa3b; game-runtime:5e04fc3c8d91a8c5; integration:892306a4a4fbec1d; engine-src:b08a629e4c7cb2e0 |
| persistent lane manifests | PASS | tool-runtime:REUSED; game-runtime:REUSED; integration:REUSED; engine-src:REUSED |
| lane warm-start reuse | PASS | tool-runtime:REUSED; game-runtime:REUSED; integration:REUSED; engine-src:REUSED |
| dependency hydration reuse | PASS | tool-runtime:REUSED; game-runtime:REUSED; integration:REUSED; engine-src:REUSED |
| lane input graph expansion | PASS | No inputs escaped manifest scope. |
| scoped discovery targets | PASS | tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FixedTicker.test.mjs; tests/core/FrameClock.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs; tests/playwright/games/AsteroidsBeatTiming.spec.mjs; tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs; tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs; tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs; tests/playwright/tools/AssetManagerV2.spec.mjs; tests/playwright/tools/CollisionInspectorV2.spec.mjs; tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs; tests/render/Renderer.test.mjs |
| broad scan prevention | PASS | Discovery map read 0 targeted file(s)/helper(s); lane-directory enumeration is delegated only to standalone broad audit mode. |
| invalid lane target detection | PASS | No invalid lane target findings. |
| Windows quoting hazard detection | PASS | Lane tool-runtime grep pattern is passed as a literal Node argv value: launch guard|temporary UAT context|rejects non-Workspace |
| duplicate lane registration detection | PASS | No duplicate lane registrations found. |
| invalid grep pattern detection | PASS | No invalid grep pattern findings. |

## Fast-Fail Reasons

No fast-fail reasons. Playwright lanes may proceed when selected.

## Runtime Savings Observations

- Static validation runs before browser launch.
- Structural failures stop Workspace V2, tool-runtime, integration, and sample Playwright lanes before browser startup.
- Combined lane execution can validate multiple selected lanes through one Node runner process.
- Playwright is invoked through the Node CLI entrypoint to avoid shell quoting discovery failures.
