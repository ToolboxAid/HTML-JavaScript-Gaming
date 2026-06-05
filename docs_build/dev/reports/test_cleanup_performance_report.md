# Test Cleanup Performance Report

Generated: 2026-06-05T19:46:26.019Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 22.71s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 14
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
| asset-tool | PASS | 22.71s | 1 | Asset Tool rebuild slice validates SQL-shaped asset tables, ready Game Configuration handoff, import/preview workflow, and visible validation errors without exercising unrelated toolbox routes. |
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
| asset-tool | 4.60s | tests\playwright\tools\AssetToolMockRepository.spec.mjs:200:1 > Asset Role changes update picker mode, usage options, and import form layout | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| asset-tool | 4.40s | tests\playwright\tools\AssetToolMockRepository.spec.mjs:368:1 > Asset upload failures are visible and project context is required | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| asset-tool | 3.10s | tests\playwright\tools\AssetToolMockRepository.spec.mjs:286:1 > Image, video, and audio uploads create project-owned metadata and previews | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| asset-tool | 2.30s | tests\playwright\tools\AssetToolMockRepository.spec.mjs:145:1 > Assets page lists all asset roles and starts from active project context | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| asset-tool | 545ms | tests\playwright\tools\AssetToolMockRepository.spec.mjs:77:1 > Asset Tool repository exposes SQL-shaped role, storage, and metadata ownership | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
