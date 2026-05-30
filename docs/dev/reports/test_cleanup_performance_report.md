# Test Cleanup Performance Report

Generated: 2026-05-30T05:25:56.095Z
Status: WARN

## Cost Summary

Total measured lane elapsed time: 665.65s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 5
Reused manifests: 1
Reused snapshots: 1
Cached validations reused: 18
Prevented broad execution: 2
Prevented reruns: 0
Prevented redundant browser launches: 0
Prevented graph rebuilds: 1
Prevented redundant dependency traversal: 1

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | FAIL | 665.65s | 1 | Workspace V2 contract lane validates launch, manifest handoff, toolState open/save, and lifecycle contracts. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| workspace-contract | 120.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:15334:3 > Workspace Manager V2 bootstrap > owns temporary UAT manifest seeding and launches Asset Manager V2 through session context | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 47.40s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3980:3 > Workspace Manager V2 bootstrap > shows Object Vector Studio V2 layout shell and schema-only palette gate | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 29.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3149:3 > Workspace Manager V2 bootstrap > launches Input Mapping V2 and captures keyboard mappings | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 22.90s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:2676:3 > Workspace Manager V2 bootstrap > honors Input Mapping V2 gesture-specific capture sessions | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 19.70s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6498:3 > Workspace Manager V2 bootstrap > creates Object Vector Studio V2 shapes with canvas drawing and snap modes | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 9.70s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11871:3 > Workspace Manager V2 bootstrap > launches Storage Inspector V2 with V2 labels, accordions, theme, and delete controls | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 9.30s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7748:3 > Workspace Manager V2 bootstrap > edits Object Vector Studio V2 preview shapes with mouse actions and tile delete controls | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 9.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10866:3 > Workspace Manager V2 bootstrap > loads Text to Speech V2 from URL JSON with full options, schema-complete queue, and speech actions | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 8.50s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8596:3 > Workspace Manager V2 bootstrap > supports Object Vector Studio V2 animation states and frame timeline foundation | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 7.50s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:12733:3 > Workspace Manager V2 bootstrap > enables object vector and collision tools only from manifest geometry without fallback defaults | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
