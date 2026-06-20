# Slow Path Pruning Report

Generated: 2026-06-20T15:21:49.846Z
Status: PASS
Source timing evidence: docs_build/dev/reports/test_cleanup_performance_report.md (2026-05-26T21:18:42.199Z)

## Before / After Runtime Observations

PR_26146_038 measured lane elapsed time: 169.71s
Current measured lane elapsed time: 54.19s
PR_26146_038 actual browser launches: 4
Current actual browser launches: 1
Accidental no-argument browser launches prevented: 5
Reduced Workspace lane nested launches: 1
Reused dependency hydration: 1
Reused snapshots: 1
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
| current targeted run | workspace-contract | 12.00s | tests\playwright\tools\RootToolsFutureState.spec.mjs:270:1 > root tools surface links current tool pages without old_* routes |
| current targeted run | workspace-contract | 11.90s | tests\playwright\tools\RootToolsFutureState.spec.mjs:662:1 > representative active tool pages align center cleanup and registry group colors |
| current targeted run | workspace-contract | 11.30s | tests\playwright\tools\RootToolsFutureState.spec.mjs:560:1 > learn wireframe pages load with shared Theme V2 structure |
| current targeted run | workspace-contract | 8.70s | tests\playwright\tools\RootToolsFutureState.spec.mjs:480:1 > common header renders primary navigation order across active pages |
| current targeted run | workspace-contract | 1.50s | tests\playwright\tools\RootToolsFutureState.spec.mjs:639:1 > tool template future-state page loads from root Theme V2 paths |

## Guardrails

Full samples smoke: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.
Runtime failures observed: 0
Runtime schedule status: PASS

- Only no-argument broad defaults and safe Workspace legacy routing were pruned.
- Slow individual tests were reported but not deleted, consolidated, or fixture-rewritten.
- Explicit targeted lane execution remains available through --lane and --lanes.
- Broad all-lane execution requires explicit --all.
