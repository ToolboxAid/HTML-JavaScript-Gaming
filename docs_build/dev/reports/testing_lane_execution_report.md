# Testing Lane Execution Report

Generated: 2026-06-05T17:56:30.265Z
Dry run: No

## Summary

PASS: 2
WARN: 0
FAIL: 0
SKIP: 13
Total lane elapsed time: 53.48s
Actual browser launches: 2

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs_build/dev/reports/playwright_discovery_ownership_report.md --scope-report docs_build/dev/reports/playwright_discovery_scope_report.md --scan-report docs_build/dev/reports/filesystem_scan_reduction_report.md --lanes asset-tool,project-workspace --targets tests/playwright/tools/AssetToolMockRepository.spec.mjs,tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: project-workspace, asset-tool
Reused runtime sessions: 1
Reused lane snapshots: 1
Reused warm-start lanes: 1
Reused dependency hydration: 1
Prevented graph rebuilds: 1
Prevented redundant initialization: 1
Prevented redundant browser launches: 0
Prevented redundant lane execution: 13

## Validation Cache

Cached validations reused: 18
Validation computations: 10

## Failure Fingerprints

Status: PASS
Deterministic setup failures: 0
Runtime failures: 0
Flaky/transient failures: 0
Infrastructure failures: 0
Prevented reruns: 0
Prevented browser launches: 0
Prevented broad lane escalation: 0

## Discovery Scope

Status: PASS
Target files: tests/playwright/tools/AssetToolMockRepository.spec.mjs, tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 5
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: asset-tool:PASS, project-workspace:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 3
Persistent manifest events: asset-tool:INVALIDATED, project-workspace:REUSED

## Warm-Start Reuse

Status: PASS
Warm-start events: asset-tool:INVALIDATED, project-workspace:REUSED
Dependency hydration events: asset-tool:INVALIDATED, project-workspace:REUSED
Prevented redundant initialization: 1
Prevented helper resolution passes: 2
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: asset-tool:INVALIDATED, project-workspace:REUSED
Reused snapshots: 1
Invalidated snapshots: 1
Prevented graph rebuilds: 1
Prevented redundant dependency traversal: 1
Prevented fixture/helper graph assembly: 2

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| project-workspace | PASS | 38.66s | 1 | Project Workspace rebuild slice validates mock users/projects/project_members data actions, project lifecycle controls, and project-driven Progress/Build Path copy without exercising unrelated toolbox routes. | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | repo-served Project Workspace page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock project repository |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Project Workspace mock project context |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| asset-tool | PASS | 14.82s | 1 | Asset Tool rebuild slice validates SQL-shaped asset tables, ready Game Configuration handoff, import/preview workflow, and visible validation errors without exercising unrelated toolbox routes. | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | repo-served Assets page; in-memory SQL-shaped Asset Tool mock repository; Game Configuration mock repository handoff; file-name/path-based import preview |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Project Workspace mock project context; Toolbox role simulation |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | repo-served Admin Tools Progress page; repo-served Toolbox Group view; Toolbox registry build sequence; Project Build Path workflow table |
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | repo-served Admin Tools Progress page; repo-served Project Workspace, Game Design, and Game Configuration tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata |
| tool-display-mode | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Tool Display Mode identity row, registry-owned previous/next links, disabled text fallback, and multi-path group routing | repo-served Project Workspace, Game Design, Game Configuration, and AI Assistant tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata; shared Theme V2 Tool Display Mode script |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | Toolbox registry badge/tool image contract; repo-served Toolbox page; repo-served representative Toolbox tool pages; shared registry image fallback |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Active public toolbox and Tool Template V2 contract | repo-served root toolbox page; Tool Template V2 public page; Theme V2 shared partials and assets |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Integration handoff behavior | No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| project-workspace | 7.60s | tests\playwright\tools\ProjectWorkspaceMockRepository.spec.mjs:259:1 > representative Toolbox tool pages use the wide Theme V2 layout |
| project-workspace | 5.50s | tests\playwright\tools\ProjectWorkspaceMockRepository.spec.mjs:376:1 > Toolbox member-role filters focus tools without exposing admin-only controls |
| project-workspace | 4.60s | tests\playwright\tools\ProjectWorkspaceMockRepository.spec.mjs:326:1 > Toolbox Project Data controls are admin-only and drive mock Build Path state |
| asset-tool | 3.00s | tests\playwright\tools\AssetToolMockRepository.spec.mjs:214:1 > Asset upload failures are visible and project context is required |
| project-workspace | 2.70s | tests\playwright\tools\ProjectWorkspaceMockRepository.spec.mjs:96:1 > Project Workspace displays and edits project purpose and member role |

## Commands

### workspace-contract
- SKIP

### project-workspace
- PASS 38.66s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### game-design
- SKIP

### game-configuration
- SKIP

### asset-tool
- PASS 14.82s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### build-path
- SKIP

### tools-progress
- SKIP

### tool-navigation
- SKIP

### tool-display-mode
- SKIP

### tool-images
- SKIP

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
