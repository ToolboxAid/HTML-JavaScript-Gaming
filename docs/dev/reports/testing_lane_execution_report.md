# Testing Lane Execution Report

Generated: 2026-06-02T20:50:23.811Z
Dry run: No

## Summary

PASS: 0
WARN: 0
FAIL: 1
SKIP: 5
Total lane elapsed time: 101.74s
Actual browser launches: 1

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs/dev/reports/playwright_discovery_ownership_report.md --scope-report docs/dev/reports/playwright_discovery_scope_report.md --scan-report docs/dev/reports/filesystem_scan_reduction_report.md --lanes workspace-contract --targets tests/playwright/tools/WorkspaceManagerV2.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs --fixtures games/AITargetDummy/game.manifest.json,games/Asteroids/game.manifest.json,games/Bouncing-ball/game.manifest.json,games/Breakout/game.manifest.json,games/GravityWell/game.manifest.json,games/InvalidWorkspace/game.manifest.json,games/Pacman/game.manifest.json,games/Pong/game.manifest.json,games/SolarSystem/game.manifest.json,games/SpaceDuel/game.manifest.json,games/SpaceInvaders/game.manifest.json,games/vector-arcade-sample/game.manifest.json,tests/fixtures/workspace-v2/uat.manifest.json
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: workspace-contract
Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 0
Prevented redundant lane execution: 5

## Validation Cache

Cached validations reused: 18
Validation computations: 10

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
Target files: tests/playwright/tools/WorkspaceManagerV2.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: games/AITargetDummy/game.manifest.json, games/Asteroids/game.manifest.json, games/Bouncing-ball/game.manifest.json, games/Breakout/game.manifest.json, games/GravityWell/game.manifest.json, games/InvalidWorkspace/game.manifest.json, games/Pacman/game.manifest.json, games/Pong/game.manifest.json, games/SolarSystem/game.manifest.json, games/SpaceDuel/game.manifest.json, games/SpaceInvaders/game.manifest.json, games/vector-arcade-sample/game.manifest.json, tests/fixtures/workspace-v2/uat.manifest.json
Targeted file/helper reads: 5
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: workspace-contract:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 4
Persistent manifest events: workspace-contract:INVALIDATED

## Warm-Start Reuse

Status: PASS
Warm-start events: workspace-contract:INVALIDATED
Dependency hydration events: workspace-contract:INVALIDATED
Prevented redundant initialization: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: workspace-contract:INVALIDATED
Reused snapshots: 0
Invalidated snapshots: 1
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0
Prevented fixture/helper graph assembly: 0

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | FAIL | 101.74s | 1 | Workspace V2 contract lane validates launch, manifest handoff, toolState open/save, and lifecycle contracts. | Workspace Manager V2 contract and lifecycle behavior | tests/fixtures/workspace-v2/uat.manifest.json; mocked File System Access repo handles; explicit game manifest/toolState payloads |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | First-class tool runtime behavior | tool-specific mocked repo/file picker inputs; explicit manifest/toolState launch contexts |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game-owned Playwright runtime behavior | explicit Asteroids manifest/page fixtures; repo-served browser pages |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Workspace, tool, game index, and manifest handoff behavior | repo game manifests; manifest preview asset roles; repo-served browser pages |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Affected samples lane, on request only | sample metadata and validation artifacts; sample structure fixtures |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| workspace-contract | 36.80s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:12839:3 > Workspace Manager V2 bootstrap > uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles |
| workspace-contract | 28.70s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3151:3 > Workspace Manager V2 bootstrap > launches Input Mapping V2 and captures keyboard mappings |
| workspace-contract | 10.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11874:3 > Workspace Manager V2 bootstrap > launches Storage Inspector V2 with V2 labels, accordions, theme, and delete controls |
| workspace-contract | 2.90s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:15357:3 > Workspace Manager V2 bootstrap > owns temporary UAT manifest seeding and launches Asset Manager V2 through session context |
| workspace-contract | 2.50s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3932:3 > Workspace Manager V2 bootstrap > launches World Vector Studio V2 and Object Vector Studio V2 copied tool shells |

## Commands

### workspace-contract
- FAIL 101.73s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep launch

### tool-runtime
- SKIP

### game-runtime
- SKIP

### integration
- SKIP

### engine-src
- SKIP

### samples
- SKIP
