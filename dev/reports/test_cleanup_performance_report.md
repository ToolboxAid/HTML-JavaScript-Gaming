# Test Cleanup Performance Report

Generated: 2026-06-23T16:38:57.091Z
Status: WARN

## Cost Summary

Total measured lane elapsed time: 8.76s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 14
Reused manifests: 0
Reused snapshots: 0
Cached validations reused: 18
Prevented broad execution: 2
Prevented reruns: 0
Prevented redundant browser launches: 0
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | FAIL | 8.76s | 1 | Workspace V2 command now validates the future-state tools surface without exercising deprecated toolbox/old_* routes. |
| game-hub | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-design | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| asset-tool | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
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
| workspace-contract | 0ms | tests\playwright\tools\RootToolsFutureState.spec.mjs:270:1 > root tools surface links current tool pages without old_* routes | "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 0ms | tests\playwright\tools\RootToolsFutureState.spec.mjs:485:1 > common header renders primary navigation order across active pages | "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 0ms | tests\playwright\tools\RootToolsFutureState.spec.mjs:565:1 > learn wireframe pages load with shared Theme V2 structure | "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 0ms | tests\playwright\tools\RootToolsFutureState.spec.mjs:644:1 > tool template future-state page loads from root Theme V2 paths | "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |
| workspace-contract | 0ms | tests\playwright\tools\RootToolsFutureState.spec.mjs:667:1 > representative active tool pages align center cleanup and registry group colors | "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
