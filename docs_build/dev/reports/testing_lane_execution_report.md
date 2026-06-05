# Testing Lane Execution Report

Generated: 2026-06-05T17:10:24.348Z
Dry run: No

## Summary

PASS: 5
WARN: 0
FAIL: 0
SKIP: 10
Total lane elapsed time: 118.61s
Actual browser launches: 5

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs_build/dev/reports/playwright_discovery_ownership_report.md --scope-report docs_build/dev/reports/playwright_discovery_scope_report.md --scan-report docs_build/dev/reports/filesystem_scan_reduction_report.md --lanes asset-tool,tools-progress,tool-runtime,build-path,project-workspace --targets tests/playwright/tools/AssetToolMockRepository.spec.mjs,tests/playwright/tools/BuildPathProgressSimplification.spec.mjs,tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs,tests/playwright/tools/RootToolsFutureState.spec.mjs,tests/playwright/tools/ToolsProgressHydration.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: project-workspace, asset-tool, build-path, tools-progress, tool-runtime
Reused runtime sessions: 1
Reused lane snapshots: 4
Reused warm-start lanes: 4
Reused dependency hydration: 4
Prevented graph rebuilds: 4
Prevented redundant initialization: 4
Prevented redundant browser launches: 0
Prevented redundant lane execution: 10

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
Target files: tests/playwright/tools/AssetToolMockRepository.spec.mjs, tests/playwright/tools/BuildPathProgressSimplification.spec.mjs, tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs, tests/playwright/tools/RootToolsFutureState.spec.mjs, tests/playwright/tools/ToolsProgressHydration.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 3
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: asset-tool:PASS, tools-progress:PASS, tool-runtime:PASS, build-path:PASS, project-workspace:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 0
Persistent manifest events: asset-tool:REUSED, tools-progress:REUSED, tool-runtime:REUSED, build-path:REUSED, project-workspace:INVALIDATED

## Warm-Start Reuse

Status: PASS
Warm-start events: asset-tool:REUSED, tools-progress:REUSED, tool-runtime:REUSED, build-path:REUSED, project-workspace:INVALIDATED
Dependency hydration events: asset-tool:REUSED, tools-progress:REUSED, tool-runtime:REUSED, build-path:REUSED, project-workspace:INVALIDATED
Prevented redundant initialization: 4
Prevented helper resolution passes: 16
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: asset-tool:REUSED, tools-progress:REUSED, tool-runtime:REUSED, build-path:REUSED, project-workspace:INVALIDATED
Reused snapshots: 4
Invalidated snapshots: 1
Prevented graph rebuilds: 4
Prevented redundant dependency traversal: 4
Prevented fixture/helper graph assembly: 16

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| project-workspace | PASS | 32.20s | 1 | Project Workspace rebuild slice validates mock users/projects/project_members data actions, project lifecycle controls, and project-driven Progress/Build Path copy without exercising unrelated toolbox routes. | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | repo-served Project Workspace page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock project repository |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Project Workspace mock project context |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| asset-tool | PASS | 11.65s | 1 | Asset Tool rebuild slice validates SQL-shaped asset tables, ready Game Configuration handoff, import/preview workflow, and visible validation errors without exercising unrelated toolbox routes. | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | repo-served Assets page; in-memory SQL-shaped Asset Tool mock repository; Game Configuration mock repository handoff; file-name/path-based import preview |
| build-path | PASS | 16.47s | 1 | Build Path simplification validates removal of the separate Progress view, workflow-order status/completion table behavior, contributor N/A rows, and Admin Tools Progress navigation without exercising unrelated toolbox routes. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Project Workspace mock project context; Toolbox role simulation |
| tools-progress | PASS | 17.91s | 1 | Tools Progress validates that Admin platform progress hydrates every planned/active Toolbox registry entry in build order, the restored semantic group colors render in Toolbox Group view, and Project Build Path stays workflow-order and project-specific. | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | repo-served Admin Tools Progress page; repo-served Toolbox Group view; Toolbox registry build sequence; Project Build Path workflow table |
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | repo-served Admin Tools Progress page; repo-served Project Workspace, Game Design, and Game Configuration tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata |
| tool-display-mode | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Tool Display Mode identity row, registry-owned previous/next links, disabled text fallback, and multi-path group routing | repo-served Project Workspace, Game Design, Game Configuration, and AI Assistant tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata; shared Theme V2 Tool Display Mode script |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | Toolbox registry badge/tool image contract; repo-served Toolbox page; repo-served representative Toolbox tool pages; shared registry image fallback |
| tool-runtime | PASS | 40.38s | 1 | Tool runtime lane now validates the active public toolbox/template surface and excludes removed V2 tool routes. | Active public toolbox and Tool Template V2 contract | repo-served root toolbox page; Tool Template V2 public page; Theme V2 shared partials and assets |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Integration handoff behavior | No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| tool-runtime | 9.30s | tests\playwright\tools\RootToolsFutureState.spec.mjs:420:1 > learn wireframe pages load with shared Theme V2 structure |
| tool-runtime | 8.60s | tests\playwright\tools\RootToolsFutureState.spec.mjs:520:1 > representative active tool pages align center cleanup and registry group colors |
| tool-runtime | 7.60s | tests\playwright\tools\RootToolsFutureState.spec.mjs:69:1 > root tools surface links current tool pages without old_* routes |
| project-workspace | 6.60s | tests\playwright\tools\ProjectWorkspaceMockRepository.spec.mjs:259:1 > representative Toolbox tool pages use the wide Theme V2 layout |
| tool-runtime | 6.50s | tests\playwright\tools\RootToolsFutureState.spec.mjs:335:1 > common header renders primary navigation order across active pages |

## Commands

### workspace-contract
- SKIP

### project-workspace
- PASS 32.19s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### game-design
- SKIP

### game-configuration
- SKIP

### asset-tool
- PASS 11.65s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### build-path
- PASS 16.47s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list

### tools-progress
- PASS 17.91s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolsProgressHydration.spec.mjs --project=playwright --workers=1 --reporter=list

### tool-navigation
- SKIP

### tool-display-mode
- SKIP

### tool-images
- SKIP

### tool-runtime
- PASS 40.38s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list

### game-runtime
- SKIP

### integration
- SKIP

### engine-src
- SKIP

### samples
- SKIP
