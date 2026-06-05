# Test Cleanup Performance Report

Generated: 2026-06-05T12:43:20.765Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 25.73s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 13
Reused manifests: 0
Reused snapshots: 0
Cached validations reused: 18
Prevented broad execution: 3
Prevented reruns: 0
Prevented redundant browser launches: 0
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| project-workspace | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| build-path | PASS | 25.73s | 1 | Build Path simplification validates removal of the separate Progress view, workflow-order status/completion table behavior, contributor N/A rows, and Admin Tools Progress navigation without exercising unrelated toolbox routes. |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-display-mode | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| build-path | 6.00s | tests\playwright\tools\BuildPathProgressSimplification.spec.mjs:139:1 > Build Path tool names link to registered routes and render badge images | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list |
| build-path | 4.30s | tests\playwright\tools\BuildPathProgressSimplification.spec.mjs:74:1 > Toolbox removes Progress view and renders Build Path workflow table | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list |
| build-path | 2.60s | tests\playwright\tools\BuildPathProgressSimplification.spec.mjs:114:1 > Build Path shows N/A only for non-required contributor-focused tools | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list |
| build-path | 2.20s | tests\playwright\tools\BuildPathProgressSimplification.spec.mjs:181:1 > Admin navigation exposes Tools Progress and removes Project Progress | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
