# Testing Lane Execution Report

Generated: 2026-06-05T00:18:40.837Z
Dry run: No

## Summary

PASS: 1
WARN: 0
FAIL: 0
SKIP: 9
Total lane elapsed time: 12.55s
Actual browser launches: 1

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs_build/dev/reports/playwright_discovery_ownership_report.md --scope-report docs_build/dev/reports/playwright_discovery_scope_report.md --scan-report docs_build/dev/reports/filesystem_scan_reduction_report.md --lanes game-design --targets tests/playwright/tools/GameDesignMockRepository.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: game-design
Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 0
Prevented redundant lane execution: 9

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
Target files: tests/playwright/tools/GameDesignMockRepository.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 5
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: game-design:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 4
Persistent manifest events: game-design:GENERATED

## Warm-Start Reuse

Status: PASS
Warm-start events: game-design:GENERATED
Dependency hydration events: game-design:GENERATED
Prevented redundant initialization: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: game-design:GENERATED
Reused snapshots: 0
Invalidated snapshots: 0
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
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| project-workspace | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | repo-served Project Workspace page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock project repository |
| game-design | PASS | 12.55s | 1 | Game Design rebuild slice validates the active project context, design save/update, actionable validation, capability demo authoring, and Toolbox progress handoff without exercising unrelated toolbox routes. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Project Workspace mock project context |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Project Workspace mock project context; Toolbox role simulation |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Active public toolbox and Tool Template V2 contract | repo-served root toolbox page; Tool Template V2 public page; Theme V2 shared partials and assets |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Integration handoff behavior | No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated archive/v1-v2/samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| game-design | 2.00s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:80:1 > Game Design saves and updates design fields against the active project |
| game-design | 1.80s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:55:1 > Game Design shows an actionable overlay when project context is missing |
| game-design | 1.50s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:129:1 > Game Design authors capability demos as Project Workspace projects |
| game-design | 1.30s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:155:1 > Toolbox Build Path view shows the Game Design handoff |

## Commands

### workspace-contract
- SKIP

### project-workspace
- SKIP

### game-design
- PASS 12.55s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list

### game-configuration
- SKIP

### build-path
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
