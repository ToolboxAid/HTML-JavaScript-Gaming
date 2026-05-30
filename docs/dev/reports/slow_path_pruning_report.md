# Slow Path Pruning Report

Generated: 2026-05-30T05:25:56.096Z
Status: PASS
Source timing evidence: docs/dev/reports/test_cleanup_performance_report.md (2026-05-26T21:18:42.199Z)

## Before / After Runtime Observations

PR_26146_038 measured lane elapsed time: 169.71s
Current measured lane elapsed time: 665.65s
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
| current targeted run | workspace-contract | 120.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:15334:3 > Workspace Manager V2 bootstrap > owns temporary UAT manifest seeding and launches Asset Manager V2 through session context |
| current targeted run | workspace-contract | 47.40s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3980:3 > Workspace Manager V2 bootstrap > shows Object Vector Studio V2 layout shell and schema-only palette gate |
| current targeted run | workspace-contract | 29.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3149:3 > Workspace Manager V2 bootstrap > launches Input Mapping V2 and captures keyboard mappings |
| current targeted run | workspace-contract | 22.90s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:2676:3 > Workspace Manager V2 bootstrap > honors Input Mapping V2 gesture-specific capture sessions |
| current targeted run | workspace-contract | 19.70s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6498:3 > Workspace Manager V2 bootstrap > creates Object Vector Studio V2 shapes with canvas drawing and snap modes |
| current targeted run | workspace-contract | 9.70s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11871:3 > Workspace Manager V2 bootstrap > launches Storage Inspector V2 with V2 labels, accordions, theme, and delete controls |
| current targeted run | workspace-contract | 9.30s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7748:3 > Workspace Manager V2 bootstrap > edits Object Vector Studio V2 preview shapes with mouse actions and tile delete controls |
| current targeted run | workspace-contract | 9.00s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10866:3 > Workspace Manager V2 bootstrap > loads Text to Speech V2 from URL JSON with full options, schema-complete queue, and speech actions |
| current targeted run | workspace-contract | 8.50s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8596:3 > Workspace Manager V2 bootstrap > supports Object Vector Studio V2 animation states and frame timeline foundation |
| current targeted run | workspace-contract | 7.50s | tests\playwright\tools\WorkspaceManagerV2.spec.mjs:12733:3 > Workspace Manager V2 bootstrap > enables object vector and collision tools only from manifest geometry without fallback defaults |

## Guardrails

Full samples smoke: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.
Runtime failures observed: 1
Runtime schedule status: PASS

- Only no-argument broad defaults and safe Workspace legacy routing were pruned.
- Slow individual tests were reported but not deleted, consolidated, or fixture-rewritten.
- Explicit targeted lane execution remains available through --lane and --lanes.
- Broad all-lane execution requires explicit --all.
