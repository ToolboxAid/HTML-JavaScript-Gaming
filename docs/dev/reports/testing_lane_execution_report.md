# Testing Lane Execution Report

Generated: 2026-05-26T20:38:01.110Z
Dry run: No

## Summary

PASS: 3
WARN: 0
FAIL: 1
SKIP: 2

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs/dev/reports/playwright_discovery_ownership_report.md --scope-report docs/dev/reports/playwright_discovery_scope_report.md --scan-report docs/dev/reports/filesystem_scan_reduction_report.md --lanes tool-runtime,game-runtime,integration,engine-src --targets tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs,tests/playwright/games/AsteroidsBeatTiming.spec.mjs,tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs,tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs,tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs,tests/playwright/tools/AssetManagerV2.spec.mjs,tests/playwright/tools/CollisionInspectorV2.spec.mjs,tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs --fixtures games/Asteroids/game.manifest.json,games/GravityWell/game.manifest.json,games/Pong/game.manifest.json,tests/fixtures/workspace-v2/uat.manifest.json
Details: Lane tool-runtime grep pattern is passed as a literal Node argv value: launch guard|temporary UAT context|rejects non-Workspace

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: tool-runtime, game-runtime, integration, engine-src
Reused runtime sessions: 3
Reused warm-start lanes: 4
Reused dependency hydration: 4
Prevented redundant initialization: 4
Prevented redundant browser launches: 4
Prevented redundant lane execution: 2

## Validation Cache

Cached validations reused: 15
Validation computations: 9

## Failure Fingerprints

Status: WARN
Deterministic setup failures: 0
Runtime failures: 1
Flaky/transient failures: 0
Infrastructure failures: 0
Prevented reruns: 0
Prevented browser launches: 0
Prevented broad lane escalation: 0

## Discovery Scope

Status: PASS
Target files: tests/assets/AssetLoaderSystem.test.mjs, tests/audio/AudioService.test.mjs, tests/core/EngineCoreBoundaryBaseline.test.mjs, tests/core/FixedTicker.test.mjs, tests/core/FrameClock.test.mjs, tests/input/GamepadHapticsService.test.mjs, tests/input/GamepadInputAdapter.test.mjs, tests/input/InputMap.test.mjs, tests/input/KeyboardState.test.mjs, tests/input/MouseState.test.mjs, tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs, tests/playwright/games/AsteroidsBeatTiming.spec.mjs, tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs, tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs, tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs, tests/playwright/tools/AssetManagerV2.spec.mjs, tests/playwright/tools/CollisionInspectorV2.spec.mjs, tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs, tests/render/Renderer.test.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: games/Asteroids/game.manifest.json, games/GravityWell/game.manifest.json, games/Pong/game.manifest.json, tests/fixtures/workspace-v2/uat.manifest.json
Targeted file/helper reads: 0
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: tool-runtime:PASS, game-runtime:PASS, integration:PASS, engine-src:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 0
Persistent manifest events: tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED

## Warm-Start Reuse

Status: PASS
Warm-start events: tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED
Dependency hydration events: tool-runtime:REUSED, game-runtime:REUSED, integration:REUSED, engine-src:REUSED
Prevented redundant initialization: 4
Prevented helper resolution passes: 11
Prevented fixture ownership traversal: 6

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- |
| workspace-contract | SKIP | Lane was not selected for this targeted run. | Workspace Manager V2 contract and lifecycle behavior | tests/fixtures/workspace-v2/uat.manifest.json; mocked File System Access repo handles; explicit game manifest/toolState payloads |
| tool-runtime | PASS | Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers. | First-class tool runtime behavior | tool-specific mocked repo/file picker inputs; explicit manifest/toolState launch contexts |
| game-runtime | FAIL | Game runtime lane validates explicit game-owned Playwright behavior only. | Game-owned Playwright runtime behavior | explicit Asteroids manifest/page fixtures; repo-served browser pages |
| integration | PASS | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. | Workspace, tool, game index, and manifest handoff behavior | repo game manifests; manifest preview asset roles; repo-served browser pages |
| engine-src | PASS | Engine/src lane validates reusable runtime surfaces through targeted node tests. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | Lane was not selected for this targeted run. | Affected samples lane, on request only | sample metadata and validation artifacts; sample structure fixtures |

## Commands

### workspace-contract
- SKIP

### tool-runtime
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetManagerV2.spec.mjs --grep "launch guard|temporary UAT context|rejects non-Workspace" --project=playwright --workers=1 --reporter=list
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list

### game-runtime
- FAIL C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list

### integration
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs --grep Pong --project=playwright --workers=1 --reporter=list

### engine-src
- PASS C:\nvm4w\nodejs\node.exe scripts/run-node-test-files.mjs tests/core/EngineCoreBoundaryBaseline.test.mjs tests/core/FrameClock.test.mjs tests/core/FixedTicker.test.mjs tests/assets/AssetLoaderSystem.test.mjs tests/audio/AudioService.test.mjs tests/input/InputMap.test.mjs tests/input/KeyboardState.test.mjs tests/input/MouseState.test.mjs tests/input/GamepadInputAdapter.test.mjs tests/input/GamepadHapticsService.test.mjs tests/render/Renderer.test.mjs

### samples
- SKIP

## Runtime Assertion Failures

- `tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs:14:1` - `validates Asteroids ship visual states from manifest runtime rendering`; expected ship visual states to include `destroyed`, received `idle` and `move`.

Failure fingerprint `be91dab881d6a076` classified the failing `game-runtime` command as a targeted runtime failure. No deterministic setup failures were found, no automatic retry was attempted, and no broad lane escalation or full samples smoke was run.
