# Testing Lane Execution Report

Generated: 2026-06-28T14:20:59.095Z
Dry run: No

## Summary

PASS: 1
WARN: 0
FAIL: 0
SKIP: 14
Total lane elapsed time: 24.38s
Actual browser launches: 1

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe dev/scripts/audit-playwright-test-locations.mjs --discovery-report dev/reports/playwright_discovery_ownership_report.md --scope-report dev/reports/playwright_discovery_scope_report.md --scan-report dev/reports/filesystem_scan_reduction_report.md --lanes tool-display-mode --targets dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --helpers dev/tests/helpers/playwrightRepoServer.mjs,dev/tests/helpers/playwrightStorageIsolation.mjs,dev/tests/helpers/playwrightV8CoverageReporter.mjs,dev/tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: tool-display-mode
Reused runtime sessions: 0
Reused lane snapshots: 1
Reused warm-start lanes: 1
Reused dependency hydration: 1
Prevented graph rebuilds: 1
Prevented redundant initialization: 1
Prevented redundant browser launches: 0
Prevented redundant lane execution: 14

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
Target files: dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs
Required shared helpers: dev/tests/helpers/playwrightRepoServer.mjs, dev/tests/helpers/playwrightStorageIsolation.mjs, dev/tests/helpers/playwrightV8CoverageReporter.mjs, dev/tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 0
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: tool-display-mode:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 0
Persistent manifest events: tool-display-mode:REUSED

## Warm-Start Reuse

Status: PASS
Warm-start events: tool-display-mode:REUSED
Dependency hydration events: tool-display-mode:REUSED
Prevented redundant initialization: 1
Prevented helper resolution passes: 4
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: tool-display-mode:REUSED
Reused snapshots: 1
Invalidated snapshots: 0
Prevented graph rebuilds: 1
Prevented redundant dependency traversal: 1
Prevented fixture/helper graph assembly: 4

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| game-hub | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Hub mock repository, Game Hub UI, and Toolbox Progress/Build Path game-state bridge | repo-served Game Hub page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock game repository |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Game Hub mock game context |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| asset-tool | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | repo-served Assets page; in-memory SQL-shaped Asset Tool mock repository; Game Configuration mock repository handoff; file-name/path-based import preview |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Game Hub mock game context; Toolbox role simulation |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Admin Tools Progress hydration, Toolbox Group view color model, and Game Build Path separation | repo-served Admin Tools Progress page; repo-served Toolbox Group view; Toolbox registry build sequence; Game Build Path workflow table |
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox route links, Tool Display Mode deprecated previous/next removal, and Toolbox group fallback routing | repo-served Toolbox page; repo-served Game Design tool page; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry route metadata |
| tool-display-mode | PASS | 24.38s | 1 | Tool Display Mode validates the single-line summary contract, direct summary children, registry-owned badge/tool art, fullscreen/exit icon swap, and removal of the deprecated body/navigation row without exercising unrelated toolbox routes. | Tool Display Mode single-line summary, registry-owned badge/tool images, and fullscreen icon swap | repo-served Game Hub, Game Design, Game Configuration, and Build Game tool pages; Toolbox registry image metadata; shared Theme V2 Tool Display Mode script |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | Toolbox registry badge/tool image contract; repo-served Toolbox page; repo-served representative Toolbox tool pages; shared registry image fallback |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Active public toolbox and Tool Template V2 contract | repo-served root toolbox page; Tool Template V2 public page; Theme V2 shared partials and assets |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated dev/archive/v1-v2/games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Integration handoff behavior | No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated dev/archive/v1-v2/samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| tool-display-mode | 10.70s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:184:1 > representative tools use registry-owned names and images in the single-line summary |
| tool-display-mode | 3.40s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:204:1 > fullscreen mode swaps to the exit icon without restoring old body or navigation markup |
| tool-display-mode | 3.10s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:171:1 > Game Design renders badge, tool name, character image, and fullscreen icon as direct summary children |

## Commands

### workspace-contract
- SKIP

### game-hub
- SKIP

### game-design
- SKIP

### game-configuration
- SKIP

### asset-tool
- SKIP

### build-path
- SKIP

### tools-progress
- SKIP

### tool-navigation
- SKIP

### tool-display-mode
- PASS 24.38s C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 1\\node_modules\\@playwright\\test\\cli.js" test dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --config=dev/config/playwright.config.cjs --project=playwright --workers=1 --reporter=list

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
