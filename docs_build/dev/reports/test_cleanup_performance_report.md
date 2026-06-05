# Test Cleanup Performance Report

Generated: 2026-06-05T01:16:40.604Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 16.55s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 11
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
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-navigation | PASS | 16.55s | 1 | Tool navigation validates registry-owned tool routes, disabled rendering for route-less tools, build-order previous/next controls, multi-path fallback to Toolbox Group view, and role query preservation without exercising unrelated toolbox routes. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| tool-navigation | 3.10s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:60:1 > Admin Tools Progress links routed tools and marks route-less tools as planned | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-navigation | 2.50s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:130:1 > multi-path next control routes to Toolbox Group view and preserves role | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:100:1 > Tool Display Mode renders build-order previous and next controls | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:115:1 > Project Workspace Tool Display Mode follows registry build order | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:155:1 > Toolbox Group view can be selected directly with only the requested group expanded | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
