# Test Cleanup Performance Report

Generated: 2026-05-26T22:17:24.434Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 13.49s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 2
Skipped lanes: 5
Reused manifests: 0
Reused snapshots: 0
Cached validations reused: 18
Prevented broad execution: 3
Prevented reruns: 0
Prevented redundant browser launches: 1
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | PASS | 13.49s | 1 | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| integration | 2.20s | tests\playwright\integration\GameIndexPreviewManifestResolution.spec.mjs:62:1 > games index resolves Pong thumbnail from manifest preview role | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list |
| integration | 1.80s | tests\playwright\integration\GameIndexPreviewManifestResolution.spec.mjs:113:1 > Pong page keeps safe placeholder when preview role is absent | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list |
| integration | 1.40s | tests\playwright\integration\GameIndexPreviewManifestResolution.spec.mjs:88:1 > Pong page resolves thumbnail from manifest preview role | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list |
| integration | 1.30s | tests\playwright\integration\ToolsIndexFirstClassToolRegistration.spec.mjs:28:1 > renders Asset Manager V2 as a first-class tool in the tools index | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
