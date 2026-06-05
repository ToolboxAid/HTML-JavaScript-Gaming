# Lane Compilation Report

Generated: 2026-06-05T00:18:28.233Z
Status: PASS

## Lane Graph

| Lane | Status | Affected Surface | Targets | Commands | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | Root tools future-state navigation and Tool Template V2 contract | tests/playwright/tools/RootToolsFutureState.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| project-workspace | SKIP | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| game-design | PASS | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | tests/playwright/tools/GameDesignMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane graph, command shape, targets, fixtures, and ownership compile before runtime. |
| game-configuration | SKIP | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | tests/playwright/tools/GameConfigurationMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameConfigurationMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| build-path | SKIP | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | tests/playwright/tools/BuildPathProgressSimplification.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-runtime | SKIP | Active public toolbox and Tool Template V2 contract | tests/playwright/tools/RootToolsFutureState.spec.mjs | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| game-runtime | SKIP | Deprecated archive/v1-v2/games reference coverage | none | none | Lane was not selected. |
| integration | SKIP | Integration handoff behavior | none | none | Lane was not selected. |
| engine-src | SKIP | src/ engine and shared runtime capability behavior | tests/core/EngineCoreBoundaryBaseline.test.mjs; tests/core/FrameClock.test.mjs; tests/core/FixedTicker.test.mjs; tests/assets/AssetLoaderSystem.test.mjs; tests/audio/AudioService.test.mjs; tests/input/InputMap.test.mjs; tests/input/KeyboardState.test.mjs; tests/input/MouseState.test.mjs; tests/input/GamepadInputAdapter.test.mjs; tests/input/GamepadHapticsService.test.mjs; tests/render/Renderer.test.mjs | C:\nvm4w\nodejs\node.exe scripts/run-node-test-files.mjs tests/core/EngineCoreBoundaryBaseline.test.mjs tests/core/FrameClock.test.mjs tests/core/FixedTicker.test.mjs tests/assets/AssetLoaderSystem.test.mjs tests/audio/AudioService.test.mjs tests/input/InputMap.test.mjs tests/input/KeyboardState.test.mjs tests/input/MouseState.test.mjs tests/input/GamepadInputAdapter.test.mjs tests/input/GamepadHapticsService.test.mjs tests/render/Renderer.test.mjs | Lane was not selected. |
| samples | SKIP | Deprecated archive/v1-v2/samples reference coverage | none | none | Lane was not selected. |

## Compilation Failures

No lane compilation failures.

## Deterministic Setup Rules

- Unknown lanes fail before runtime.
- Missing targets or fixtures fail before runtime.
- Playwright targets must stay inside the owning lane directory.
- Shell-sensitive grep values must be passed through the Node CLI argv path.
- Deterministic lane-definition failures do not trigger fallback reruns or full lane escalation.
