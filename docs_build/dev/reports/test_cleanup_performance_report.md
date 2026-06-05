# Test Cleanup Performance Report

Generated: 2026-06-05T04:46:33.521Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 14.65s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 13
Reused manifests: 1
Reused snapshots: 1
Cached validations reused: 18
Prevented broad execution: 3
Prevented reruns: 0
Prevented redundant browser launches: 0
Prevented graph rebuilds: 1
Prevented redundant dependency traversal: 1

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
| tool-display-mode | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-images | PASS | 14.65s | 1 | Tool image registry validates every active/planned tool image contract, approved Theme V2 image paths, no size-suffix registry references, registry-owned fallback for missing art, and representative Toolbox image consumption without exercising unrelated toolbox routes. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| tool-images | 4.30s | tests\playwright\tools\ToolImageRegistry.spec.mjs:126:1 > representative tool pages consume registry images in Tool Display Mode | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolImageRegistry.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-images | 3.10s | tests\playwright\tools\ToolImageRegistry.spec.mjs:108:1 > Toolbox cards consume registry image sources | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolImageRegistry.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-images | 628ms | tests\playwright\tools\ToolImageRegistry.spec.mjs:72:1 > registry defines approved badge and tool image fields for every active tool | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolImageRegistry.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-images | 529ms | tests\playwright\tools\ToolImageRegistry.spec.mjs:88:1 > registry reports missing images and resolves them through the shared fallback | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/ToolImageRegistry.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
