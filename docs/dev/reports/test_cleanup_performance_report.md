# Test Cleanup Performance Report

Generated: 2026-05-26T21:44:59.272Z
Status: WARN

## Cost Summary

Total measured lane elapsed time: 112.58s
Actual browser launch count: 4
Scheduled browser launch count: 4
Baseline browser launch count: 8
Skipped lanes: 2
Reused manifests: 4
Reused snapshots: 4
Cached validations reused: 18
Prevented broad execution: 3
Prevented reruns: 0
Prevented redundant browser launches: 4
Prevented graph rebuilds: 4
Prevented redundant dependency traversal: 4

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |
| tool-runtime | PASS | 76.23s | 2 | Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers. |
| game-runtime | FAIL | 23.38s | 1 | Game runtime lane validates explicit game-owned Playwright behavior only. |
| integration | PASS | 11.97s | 1 | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. |
| engine-src | PASS | 1.00s | 0 | Engine/src lane validates reusable runtime surfaces through targeted node tests. |
| samples | SKIP | 0ms | 0 | Lane was not selected for this targeted run. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| tool-runtime | 12.10s | tests\playwright\tools\AssetManagerV2.spec.mjs:342:3 > Asset Manager V2 > launches Asset Manager V2 with temporary UAT context and schema-complete asset controls | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetManagerV2.spec.mjs --grep "launch guard|temporary UAT context|rejects non-Workspace" --project=playwright --workers=1 --reporter=list |
| tool-runtime | 7.30s | tests\playwright\tools\CollisionInspectorV2.spec.mjs:257:3 > Collision Inspector V2 > loads a game manifest and reports live vector, pixel, bounds, and hybrid collisions | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-runtime | 6.70s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:352:3 > Preview Generator V2 baseline > exercises controls, required-field gating, accordions, paths layout, and status clear | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-runtime | 6.00s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:447:3 > Preview Generator V2 baseline > phase folder input enumerates existing sample folders only | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-runtime | 5.60s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:488:3 > Preview Generator V2 baseline > generates real batch output with skip, failure, status, and summary assertions | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| tool-runtime | 2.90s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:586:3 > Preview Generator V2 baseline > launches Tool Template V2 with runtime-valid controls | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-runtime | 2.70s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:70:1 > loads Asteroids background image from Asset Manager background role only | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-runtime | 2.40s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:103:1 > omits optional Asteroids background image when Asset Manager background role is absent | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-runtime | 2.40s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:158:1 > omits optional Asteroids bezel image when Asset Manager bezel role is absent | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list |
| game-runtime | 2.30s | tests\playwright\games\AsteroidsShipStateVisuals.spec.mjs:14:1 > validates Asteroids ship visual states from manifest runtime rendering | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list |

## Prevented Broad Execution

- Workspace V2 lane was not scheduled without explicit selection.
- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
