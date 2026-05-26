# Slow Path Pruning Report

Generated: 2026-05-26T21:44:59.273Z
Status: PASS
Source timing evidence: docs/dev/reports/test_cleanup_performance_report.md (2026-05-26T21:18:42.199Z)
Note: PR_26146_038 timing values were captured before this PR regenerated the standard performance report path during validation.

## Before / After Runtime Observations

PR_26146_038 measured lane elapsed time: 169.71s
Current measured lane elapsed time: 112.58s
PR_26146_038 actual browser launches: 4
Current actual browser launches: 4
Accidental no-argument browser launches prevented: 5
Reduced Workspace lane nested launches: 1
Reused dependency hydration: 4
Reused snapshots: 4
Validation cache hits: 18

## Slow Paths Optimized

| Optimized Path | Before | After | Evidence | Result |
| --- | --- | --- | --- | --- |
| No-argument targeted lane runner | 5 browser launches | 0 browser launches | PR_26146_038 showed broad lanes stayed skipped only when lanes were explicitly selected; the no-argument runner path still defaulted to all lanes. | No lane requests now enter safe mode and schedule no runtime lanes until a lane or --all is explicit. |
| Workspace contract lane startup | 1 nested npm startup | 0 nested npm startup | PR_26146_038 routing report listed test:workspace-v2 as a direct Playwright legacy entry path. | Workspace contract lane now invokes the Node Playwright CLI directly through lane scheduling. |
| test:workspace-v2 package script | direct Playwright command bypassed lane preflight | targeted runner preflight before Workspace Playwright launch | PR_26146_038 routing report identified test:workspace-v2 as a legacy direct Playwright script. | Legacy Workspace script now routes through the workspace-contract lane. |

## Remaining Known Expensive Tests

| Source | Lane | Duration | Test |
| --- | --- | --- | --- |
| PR_26146_038 | tool-runtime | 19.10s | Asset Manager V2 temporary UAT context |
| PR_26146_038 | integration | 14.50s | games index resolves Pong thumbnail from manifest preview role |
| PR_26146_038 | tool-runtime | 10.10s | Preview Generator V2 real batch output |
| current targeted run | tool-runtime | 12.10s | tests\playwright\tools\AssetManagerV2.spec.mjs:342:3 > Asset Manager V2 > launches Asset Manager V2 with temporary UAT context and schema-complete asset controls |
| current targeted run | tool-runtime | 7.30s | tests\playwright\tools\CollisionInspectorV2.spec.mjs:257:3 > Collision Inspector V2 > loads a game manifest and reports live vector, pixel, bounds, and hybrid collisions |
| current targeted run | tool-runtime | 6.70s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:352:3 > Preview Generator V2 baseline > exercises controls, required-field gating, accordions, paths layout, and status clear |
| current targeted run | tool-runtime | 6.00s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:447:3 > Preview Generator V2 baseline > phase folder input enumerates existing sample folders only |
| current targeted run | tool-runtime | 5.60s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:488:3 > Preview Generator V2 baseline > generates real batch output with skip, failure, status, and summary assertions |
| current targeted run | tool-runtime | 2.90s | tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs:586:3 > Preview Generator V2 baseline > launches Tool Template V2 with runtime-valid controls |
| current targeted run | game-runtime | 2.70s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:70:1 > loads Asteroids background image from Asset Manager background role only |
| current targeted run | game-runtime | 2.40s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:103:1 > omits optional Asteroids background image when Asset Manager background role is absent |
| current targeted run | game-runtime | 2.40s | tests\playwright\games\AsteroidsBackgroundAssetResolution.spec.mjs:158:1 > omits optional Asteroids bezel image when Asset Manager bezel role is absent |
| current targeted run | game-runtime | 2.30s | tests\playwright\games\AsteroidsShipStateVisuals.spec.mjs:14:1 > validates Asteroids ship visual states from manifest runtime rendering |

## Guardrails

Full samples smoke: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.
Runtime failures observed: 1
Runtime schedule status: PASS

- Only no-argument broad defaults and safe Workspace legacy routing were pruned.
- Slow individual tests were reported but not deleted, consolidated, or fixture-rewritten.
- Explicit targeted lane execution remains available through --lane and --lanes.
- Broad all-lane execution requires explicit --all.
