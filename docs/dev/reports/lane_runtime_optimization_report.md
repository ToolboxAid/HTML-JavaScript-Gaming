# Lane Runtime Optimization Report

Generated: 2026-05-26T19:54:13.477Z
Status: PASS

## Runtime Cost Summary

Reused runtime sessions: 3
Prevented redundant browser launches: 4
Prevented redundant lane execution: 2
Baseline Playwright/browser launches: 8
Scheduled Playwright/browser launches: 4

## Scheduled Lane Order

1. tool-runtime
2. game-runtime
3. integration
4. engine-src

## Scheduling Blockers

No zero-browser, compilation, or dependency blockers were found.

## Lane Plans

| Lane | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |
| --- | --- | --- | --- | --- |
| tool-runtime | 3 | 2 | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetManagerV2.spec.mjs --grep "launch guard|temporary UAT context|rejects non-Workspace" --project=playwright --workers=1 --reporter=list; C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list | Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers. |
| game-runtime | 4 | 1 | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list | Game runtime lane validates explicit game-owned Playwright behavior only. |
| integration | 1 | 1 | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs --grep Pong --project=playwright --workers=1 --reporter=list | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. |
| engine-src | 0 | 0 | C:\nvm4w\nodejs\node.exe scripts/run-node-test-files.mjs tests/core/EngineCoreBoundaryBaseline.test.mjs tests/core/FrameClock.test.mjs tests/core/FixedTicker.test.mjs tests/assets/AssetLoaderSystem.test.mjs tests/audio/AudioService.test.mjs tests/input/InputMap.test.mjs tests/input/KeyboardState.test.mjs tests/input/MouseState.test.mjs tests/input/GamepadInputAdapter.test.mjs tests/input/GamepadHapticsService.test.mjs tests/render/Renderer.test.mjs | Engine/src lane validates reusable runtime surfaces through targeted node tests. |

## Runtime Savings Observations

- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.
- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.
- Unselected lanes are not scheduled after isolated targeted lane failures.
- Workspace V2 and samples lanes are not escalated unless explicitly selected.
