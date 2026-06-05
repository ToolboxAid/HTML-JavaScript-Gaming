# Test Cleanup Performance Report

Generated: 2026-06-05T02:09:17.251Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 15.12s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 12
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
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-display-mode | PASS | 15.12s | 1 | Tool Display Mode validates the two-row identity/navigation layout, anchors for previous/next targets, disabled text for missing targets, registry build-order labels, role preservation, and multi-path fallback without exercising unrelated toolbox routes. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| tool-display-mode | 2.30s | tests\playwright\tools\ToolDisplayModeNavigation.spec.mjs:107:1 > Project Workspace and Game Configuration use registry order without page hardcoding | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 2.20s | tests\playwright\tools\ToolDisplayModeNavigation.spec.mjs:174:1 > multi-path fallback opens Toolbox Group view with only the target group expanded | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 1.50s | tests\playwright\tools\ToolDisplayModeNavigation.spec.mjs:81:1 > Game Design renders identity and navigation rows with registry anchor links | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 1.40s | tests\playwright\tools\ToolDisplayModeNavigation.spec.mjs:132:1 > missing previous target renders disabled text instead of a broken link | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 1.30s | tests\playwright\tools\ToolDisplayModeNavigation.spec.mjs:150:1 > Build Game renders plain previous and next links in the second row | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
