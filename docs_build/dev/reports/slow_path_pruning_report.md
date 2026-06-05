# Slow Path Pruning Report

Generated: 2026-06-05T01:16:40.604Z
Status: PASS
Source timing evidence: docs_build/dev/reports/test_cleanup_performance_report.md (2026-05-26T21:18:42.199Z)

## Before / After Runtime Observations

PR_26146_038 measured lane elapsed time: 169.71s
Current measured lane elapsed time: 16.55s
PR_26146_038 actual browser launches: 4
Current actual browser launches: 1
Accidental no-argument browser launches prevented: 5
Reduced Workspace lane nested launches: 1
Reused dependency hydration: 0
Reused snapshots: 0
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
| current targeted run | tool-navigation | 3.10s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:60:1 > Admin Tools Progress links routed tools and marks route-less tools as planned |
| current targeted run | tool-navigation | 2.50s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:130:1 > multi-path next control routes to Toolbox Group view and preserves role |
| current targeted run | tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:100:1 > Tool Display Mode renders build-order previous and next controls |
| current targeted run | tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:115:1 > Project Workspace Tool Display Mode follows registry build order |
| current targeted run | tool-navigation | 1.30s | tests\playwright\tools\ToolNavigationPrevNext.spec.mjs:155:1 > Toolbox Group view can be selected directly with only the requested group expanded |

## Guardrails

Full samples smoke: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.
Runtime failures observed: 0
Runtime schedule status: PASS

- Only no-argument broad defaults and safe Workspace legacy routing were pruned.
- Slow individual tests were reported but not deleted, consolidated, or fixture-rewritten.
- Explicit targeted lane execution remains available through --lane and --lanes.
- Broad all-lane execution requires explicit --all.
