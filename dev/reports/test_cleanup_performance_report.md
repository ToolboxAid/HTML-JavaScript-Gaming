# Test Cleanup Performance Report

Generated: 2026-06-28T14:20:59.081Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 24.38s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 14
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
| game-hub | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| asset-tool | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tools-progress | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-navigation | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-display-mode | PASS | 24.38s | 1 | Tool Display Mode validates the single-line summary contract, direct summary children, registry-owned badge/tool art, fullscreen/exit icon swap, and removal of the deprecated body/navigation row without exercising unrelated toolbox routes. |
| tool-images | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| tool-display-mode | 10.70s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:184:1 > representative tools use registry-owned names and images in the single-line summary | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 1\\node_modules\\@playwright\\test\\cli.js" test dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --config=dev/config/playwright.config.cjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 3.40s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:204:1 > fullscreen mode swaps to the exit icon without restoring old body or navigation markup | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 1\\node_modules\\@playwright\\test\\cli.js" test dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --config=dev/config/playwright.config.cjs --project=playwright --workers=1 --reporter=list |
| tool-display-mode | 3.10s | dev\tests\playwright\tools\ToolDisplayModeSingleLineSummary.spec.mjs:171:1 > Game Design renders badge, tool name, character image, and fullscreen icon as direct summary children | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 1\\node_modules\\@playwright\\test\\cli.js" test dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --config=dev/config/playwright.config.cjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
