# Lane Compilation Report

Generated: 2026-05-31T22:47:44.457Z
Status: PASS

## Lane Graph

| Lane | Status | Affected Surface | Targets | Commands | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | Workspace Manager V2 contract and lifecycle behavior | tests/playwright/tools/WorkspaceManagerV2.spec.mjs | "C:\\Program Files\\nodejs\\node.exe" C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-runtime | SKIP | First-class tool runtime behavior | tests/playwright/tools/AssetManagerV2.spec.mjs; tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs; tests/playwright/tools/CollisionInspectorV2.spec.mjs; tests/playwright/tools/PaletteManagerV2Coverage.spec.mjs; tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs | "C:\\Program Files\\nodejs\\node.exe" C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetManagerV2.spec.mjs --grep "launch guard|temporary UAT context|rejects non-Workspace" --project=playwright --workers=1 --reporter=list; "C:\\Program Files\\nodejs\\node.exe" C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs tests/playwright/tools/PaletteManagerV2Coverage.spec.mjs tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| game-runtime | SKIP | Game-owned Playwright runtime behavior | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs; tests/playwright/games/AsteroidsBeatTiming.spec.mjs; tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs; tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | "C:\\Program Files\\nodejs\\node.exe" C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| integration | SKIP | Workspace, tool, game index, and manifest handoff behavior | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs; tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs | "C:\\Program Files\\nodejs\\node.exe" C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| engine-src | SKIP | src/ engine and shared runtime capability behavior | tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FrameClock.test.mjs; tests/core/FixedTicker.test.mjs; tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/render/Renderer.test.mjs | "C:\\Program Files\\nodejs\\node.exe" scripts/run-node-test-files.mjs tests/core/EngineCoreBoundaryBaseline.test.mjs tests/core/FrameClock.test.mjs tests/core/FixedTicker.test.mjs tests/assets/AssetLoaderSystem.test.mjs tests/audio/AudioService.test.mjs tests/input/InputMap.test.mjs tests/input/KeyboardState.test.mjs tests/input/MouseState.test.mjs tests/input/GamepadInputAdapter.test.mjs tests/input/GamepadHapticsService.test.mjs tests/render/Renderer.test.mjs | Lane was not selected. |
| samples | SKIP | Affected samples lane, on request only | tests/samples/SamplesProgramCombinedPass.test.mjs; tests/samples/FullscreenRuleEnforcement.test.mjs | "C:\\Program Files\\nodejs\\node.exe" scripts/run-node-test-files.mjs tests/samples/SamplesProgramCombinedPass.test.mjs tests/samples/FullscreenRuleEnforcement.test.mjs | Lane was not selected. |

## Compilation Failures

No lane compilation failures.

## Deterministic Setup Rules

- Unknown lanes fail before runtime.
- Missing targets or fixtures fail before runtime.
- Playwright targets must stay inside the owning lane directory.
- Shell-sensitive grep values must be passed through the Node CLI argv path.
- Deterministic lane-definition failures do not trigger fallback reruns or full lane escalation.
