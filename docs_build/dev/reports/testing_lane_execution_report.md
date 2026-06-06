# Testing Lane Execution Report

Generated: 2026-06-06T17:05:29.636Z
Dry run: No

## Summary

PASS: 1
WARN: 0
FAIL: 0
SKIP: 14
Total lane elapsed time: 22.81s
Actual browser launches: 1

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs --discovery-report docs_build/dev/reports/playwright_discovery_ownership_report.md --scope-report docs_build/dev/reports/playwright_discovery_scope_report.md --scan-report docs_build/dev/reports/filesystem_scan_reduction_report.md --lanes tool-navigation --targets tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --helpers tests/helpers/playwrightRepoServer.mjs,tests/helpers/playwrightStorageIsolation.mjs,tests/helpers/playwrightV8CoverageReporter.mjs,tests/helpers/workspaceV2CoverageReporter.mjs
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: tool-navigation
Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
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
Target files: tests/playwright/tools/ToolNavigationPrevNext.spec.mjs
Required shared helpers: tests/helpers/playwrightRepoServer.mjs, tests/helpers/playwrightStorageIsolation.mjs, tests/helpers/playwrightV8CoverageReporter.mjs, tests/helpers/workspaceV2CoverageReporter.mjs
Required fixtures: none
Targeted file/helper reads: 5
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: tool-navigation:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 4
Persistent manifest events: tool-navigation:INVALIDATED

## Warm-Start Reuse

Status: PASS
Warm-start events: tool-navigation:INVALIDATED
Dependency hydration events: tool-navigation:INVALIDATED
Prevented redundant initialization: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: tool-navigation:INVALIDATED
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
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| project-workspace | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | repo-served Project Workspace page; repo-served Toolbox page with role simulation; in-memory SQL-shaped mock project repository |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | repo-served Game Design page; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Design mock repository; Project Workspace mock project context |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | repo-served Game Configuration page; repo-served Game Design page for handoff checks; repo-served Toolbox Progress and Build Path views; in-memory SQL-shaped Game Configuration mock repository; Game Design mock repository handoff |
| asset-tool | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | repo-served Assets page; in-memory SQL-shaped Asset Tool mock repository; Game Configuration mock repository handoff; file-name/path-based import preview |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | repo-served Toolbox page; repo-served Admin Tools Progress page; Project Workspace mock project context; Toolbox role simulation |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | repo-served Admin Tools Progress page; repo-served Toolbox Group view; Toolbox registry build sequence; Project Build Path workflow table |
| tool-navigation | PASS | 22.81s | 1 | Tool navigation validates registry-owned tool routes, disabled rendering for route-less tools, build-order previous/next controls, multi-path fallback to Toolbox Group view, and role query preservation without exercising unrelated toolbox routes. | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | repo-served Admin Tools Progress page; repo-served Project Workspace, Game Design, and Game Configuration tool pages; repo-served Toolbox Group view with URL-selected accordion; Toolbox registry build sequence and route metadata |
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
| tool-navigation | 6.80s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:101:1 > Toolbox card names link to registered tool routes without duplicating launch actions |
| tool-navigation | 2.90s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:170:1 > multi-path next control routes to Toolbox Group view and preserves role |
| tool-navigation | 2.50s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:61:1 > Admin Tools Progress links routed tools and marks route-less tools as planned |
| tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:140:1 > Tool Display Mode renders build-order previous and next controls |
| tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:155:1 > Project Workspace Tool Display Mode follows registry build order |

## Commands

### workspace-contract
- SKIP

### project-workspace
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
- PASS 22.81s C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list

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

## PR_26156_189 Project Journey Manual Lane Summary

This section records the full targeted validation set for `PR_26156_189-project-journey-tool-v1`; the generated lane table above is the most recent lane-runner output.

| Command | Result | Notes |
| --- | --- | --- |
| `node --check toolbox/project-journey/project-journey.js` | PASS | Runtime syntax check. |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS | Mock repository syntax check. |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS | Targeted spec syntax check. |
| `rg --pcre2 ... toolbox/project-journey ...` | PASS | No inline CSS/script handlers, no Admin Notes coupling, no browser storage persistence in touched active files. |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1` | PASS | 6 tests; Project Journey runtime/UI, active project requirement, Workspace handoff, Toolbox registration, no Admin Notes/storage source coupling. |
| `npx playwright test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --workers=1` | PASS | 8 tests; existing Project Workspace lane stayed green after adding the Project Journey handoff and ready-tool count changes. |
| `npm run test:lane:tool-navigation` | PASS | 6 tests; Toolbox registration/navigation and Tool Display Mode build-order updates. |
| `npm run test:playwright:static` | PASS | Changed-file/static zero-browser validation. |

Full samples smoke was not run, per PR instructions.

## PR_26157_001 Project Journey Selection Counts And Ownership Manual Lane Summary

This section records the targeted validation set for `PR_26157_001-project-journey-selection-counts-and-ownership`.

| Command | Result | Notes |
| --- | --- | --- |
| `node --check toolbox/project-journey/project-journey.js` | PASS | Project Journey runtime syntax check. |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS | Project Journey mock repository syntax check. |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS | Targeted spec syntax check. |
| `rg --pcre2 ... toolbox/project-journey tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS | No inline CSS/script handlers, archive/start_of_day references, or Admin Notes coupling in touched Project Journey files. |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1` | PASS | 7 tests; status legend placement, selected-note stats, filtered aggregate stats, column order, Open/Total formulas, ownership/delete rules, selected entry styling, and Admin Notes UI absence. |
| `npm run test:playwright:static` | PASS | Changed-file/static zero-browser validation. |

Full samples smoke was not run, per PR instructions.

## PR_26156_191 Admin Notes Live Folder Listing Manual Lane Summary

This section records the targeted validation set for `PR_26156_191-admin-notes-live-folder-listing`.

| Command | Result | Notes |
| --- | --- | --- |
| `node --check admin/notes.js` | PASS | Admin Notes live listing/runtime syntax check. |
| `node --check tests/helpers/playwrightRepoServer.mjs` | PASS | Local/dev filesystem listing endpoint syntax check. |
| `node --check tests/playwright/tools/AdminNotesViewer.spec.mjs` | PASS | Admin Notes filesystem/listing spec syntax check. |
| `rg --pcre2 ... admin/notes.js admin/notes.html tests/helpers/playwrightRepoServer.mjs tests/playwright/tools/AdminNotesViewer.spec.mjs docs_build/dev/admin-notes` | PASS | No tracked directory-index references, no inline CSS/script handlers, no archive/start_of_day references. |
| `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs --workers=1` | PASS | 4 tests; live filesystem Current Folder listing, manually added folder/file, folder index links, file links, Open folder target/diagnostic, root return, traversal rejection. |
| `npm run test:playwright:static` | PASS | Changed-file/static zero-browser validation. |

Full samples smoke was not run, per PR instructions.

## PR_26156_190 Status Legend And Journey Counts Manual Lane Summary

This section records the targeted validation set for `PR_26156_190-status-legend-and-journey-counts-polish`.

| Command | Result | Notes |
| --- | --- | --- |
| `node --check admin/notes.js` | PASS | Admin Notes parser/legend runtime syntax check. |
| `node --check toolbox/project-journey/project-journey.js` | PASS | Project Journey runtime syntax check. |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS | Project Journey mock repository syntax check. |
| `node --check tests/playwright/tools/AdminNotesViewer.spec.mjs` | PASS | Admin Notes targeted spec syntax check. |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS | Project Journey targeted spec syntax check. |
| `rg --pcre2 ... admin/notes.js admin/notes.html toolbox/project-journey ...` | PASS | No inline CSS/script handlers and no archive/start_of_day references in touched active files. |
| `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs --workers=1` | PASS | 3 tests; Admin Notes parser/UI lane and raw-marker legend order. |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1` | PASS | 6 tests; Project Journey dropdown labels, status legend order, Total/Open summary counts, row editing, filters, indent/outdent, and movement behavior. |
| `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1` | PASS | 9 tests; combined targeted run used for final V8 coverage report. |
| `npm run test:playwright:static` | PASS | Changed-file/static zero-browser validation. |

Full samples smoke was not run, per PR instructions.
