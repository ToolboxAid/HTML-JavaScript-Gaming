# Lane Compilation Report

Generated: 2026-06-20T06:06:50.123Z
Status: PASS

## Lane Graph

| Lane | Status | Affected Surface | Targets | Commands | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | PASS | Root tools future-state navigation and Tool Template V2 contract | tests/playwright/tools/RootToolsFutureState.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list | Lane graph, command shape, targets, fixtures, and ownership compile before runtime. |
| game-workspace | SKIP | Game Workspace mock repository, Game Workspace UI, and Toolbox Progress/Build Path game-state bridge | tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| game-design | SKIP | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | tests/playwright/tools/GameDesignMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| game-configuration | SKIP | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | tests/playwright/tools/GameConfigurationMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/GameConfigurationMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| asset-tool | SKIP | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | tests/playwright/tools/AssetToolMockRepository.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| build-path | SKIP | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | tests/playwright/tools/BuildPathProgressSimplification.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tools-progress | SKIP | Admin Tools Progress hydration, Toolbox Group view color model, and Game Build Path separation | tests/playwright/tools/ToolsProgressHydration.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/ToolsProgressHydration.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-navigation | SKIP | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | tests/playwright/tools/ToolNavigationPrevNext.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-display-mode | SKIP | Tool Display Mode identity row, registry-owned previous/next links, disabled text fallback, and multi-path group routing | tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-images | SKIP | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | tests/playwright/tools/ToolImageRegistry.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/ToolImageRegistry.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
| tool-runtime | SKIP | Active public toolbox and Tool Template V2 contract | tests/playwright/tools/RootToolsFutureState.spec.mjs | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 2\\node_modules\\@playwright\\test\\cli.js" test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list | Lane was not selected. |
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
