# Test Cleanup Performance Report

Generated: 2026-06-05T00:18:40.824Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 12.55s
Actual browser launch count: 1
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 9
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
| game-design | PASS | 12.55s | 1 | Game Design rebuild slice validates the active project context, design save/update, actionable validation, capability demo authoring, and Toolbox progress handoff without exercising unrelated toolbox routes. |
| game-configuration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| build-path | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| game-design | 2.00s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:80:1 > Game Design saves and updates design fields against the active project | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-design | 1.80s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:55:1 > Game Design shows an actionable overlay when project context is missing | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-design | 1.50s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:129:1 > Game Design authors capability demos as Project Workspace projects | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-design | 1.30s | tests\playwright\tools\GameDesignMockRepository.spec.mjs:155:1 > Toolbox Build Path view shows the Game Design handoff | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/GameDesignMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
