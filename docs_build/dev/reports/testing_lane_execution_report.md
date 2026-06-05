# Testing Lane Execution Report

Generated: 2026-06-05T14:53:22.656Z
Dry run: No

## Summary

PASS: 4
WARN: 0
FAIL: 0
SKIP: 10
Total lane elapsed time: 136.67s
Actual browser launches: 4

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs_build/dev/reports/playwright_discovery_ownership_report.md --scope-report docs_build/dev/reports/playwright_discovery_scope_report.md --scan-report docs_build/dev/reports/filesystem_scan_reduction_report.md --lanes tool-runtime,tools-progress,game-configuration,tool-navigation --targets tests/playwright/tools/GameConfigurationMockRepository.spec.mjs,tests/playwright/tools/RootToolsFutureState.spec.mjs,tests/playwright/tools/ToolNavigationPrevNext.spec.mjs,tests/playwright/tools/ToolsProgressHydration.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: game-configuration, tools-progress, tool-navigation, tool-runtime
Reused runtime sessions: 1
Reused lane snapshots: 3
Reused warm-start lanes: 3
Reused dependency hydration: 3
Prevented graph rebuilds: 3
Prevented redundant initialization: 3
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
Target files: tests/playwright/tools/GameConfigurationMockRepository.spec.mjs, tests/playwright/tools/RootToolsFutureState.spec.mjs, tests/playwright/tools/ToolNavigationPrevNext.spec.mjs, tests/playwright/tools/ToolsProgressHydration.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 5
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: tool-runtime:PASS, tools-progress:PASS, game-configuration:PASS, tool-navigation:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 1
Persistent manifest events: tool-runtime:REUSED, tools-progress:REUSED, game-configuration:REUSED, tool-navigation:INVALIDATED

## Warm-Start Reuse

Status: PASS
Warm-start events: tool-runtime:REUSED, tools-progress:REUSED, game-configuration:REUSED, tool-navigation:INVALIDATED
Dependency hydration events: tool-runtime:REUSED, tools-progress:REUSED, game-configuration:REUSED, tool-navigation:INVALIDATED
Prevented redundant initialization: 3
Prevented helper resolution passes: 12
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: tool-runtime:REUSED, tools-progress:REUSED, game-configuration:REUSED, tool-navigation:INVALIDATED
Reused snapshots: 3
Invalidated snapshots: 1
Prevented graph rebuilds: 3
Prevented redundant dependency traversal: 3
Prevented fixture/helper graph assembly: 12

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| project-workspace | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | repo-served Project Workspace page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock project repository |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Project Workspace mock project context |
| game-configuration | PASS | 41.82s | 1 | Game Configuration rebuild slice validates the valid Game Design handoff, blocked invalid handoffs, configuration save/update, actionable validation, user-facing output, and Toolbox progress handoff without exercising unrelated toolbox routes. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Project Workspace mock project context; Toolbox role simulation |
| tools-progress | PASS | 18.23s | 1 | Tools Progress validates that Admin platform progress hydrates every planned/active Toolbox registry entry in build order, the restored semantic group colors render in Toolbox Group view, and Project Build Path stays workflow-order and project-specific. | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | repo-served Admin Tools Progress page; repo-served Toolbox Group view; Toolbox registry build sequence; Project Build Path workflow table |
| tool-navigation | PASS | 28.57s | 1 | Tool navigation validates registry-owned tool routes, disabled rendering for route-less tools, build-order previous/next controls, multi-path fallback to Toolbox Group view, and role query preservation without exercising unrelated toolbox routes. | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | repo-served Admin Tools Progress page; repo-served Project Workspace, Game Design, and Game Configuration tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata |
| tool-display-mode | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Tool Display Mode identity row, registry-owned previous/next links, disabled text fallback, and multi-path group routing | repo-served Project Workspace, Game Design, Game Configuration, and AI Assistant tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata; shared Theme V2 Tool Display Mode script |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | Toolbox registry badge/tool image contract; repo-served Toolbox page; repo-served representative Toolbox tool pages; shared registry image fallback |
| tool-runtime | PASS | 48.06s | 1 | Tool runtime lane now validates the active public toolbox/template surface and excludes removed V2 tool routes. | Active public toolbox and Tool Template V2 contract | repo-served root toolbox page; Tool Template V2 public page; Theme V2 shared partials and assets |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Integration handoff behavior | No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| tool-runtime | 10.10s | tests\playwright\tools\RootToolsFutureState.spec.mjs:517:1 > representative active tool pages align center cleanup and registry group colors |
| tool-runtime | 9.50s | tests\playwright\tools\RootToolsFutureState.spec.mjs:69:1 > root tools surface links current tool pages without old_* routes |
| tool-runtime | 9.20s | tests\playwright\tools\RootToolsFutureState.spec.mjs:417:1 > learn wireframe pages load with shared Theme V2 structure |
| tool-runtime | 7.70s | tests\playwright\tools\RootToolsFutureState.spec.mjs:332:1 > common header renders primary navigation order across active pages |
| tool-navigation | 7.50s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:101:1 > Toolbox card names link to registered tool routes without duplicating launch actions |

## Commands

### workspace-contract
- SKIP

### project-workspace
- SKIP

### game-design
- SKIP

### game-configuration
- PASS 41.82s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameConfigurationMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### build-path
- SKIP

### tools-progress
- PASS 18.23s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolsProgressHydration.spec.mjs --project=playwright --workers=1 --reporter=list

### tool-navigation
- PASS 28.57s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list

### tool-display-mode
- SKIP

### tool-images
- SKIP

### tool-runtime
- PASS 48.06s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list

### game-runtime
- SKIP

### integration
- SKIP

### engine-src
- SKIP

### samples
- SKIP
