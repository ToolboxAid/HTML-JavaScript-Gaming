# Zero-Browser Preflight Report

Generated: 2026-06-28T14:20:34.630Z
Status: PASS

## Prevented Browser Launches

Count: 0
Reason: No deterministic pre-runtime failures were found.

## Deterministic Failures Caught Pre-Runtime

No deterministic setup failures.

## Validation Coverage

| Check | Status | Details |
| --- | --- | --- |
| lane ownership | PASS | Playwright structure audit passed. |
| directory placement | PASS | toolbox/games/integration/engine ownership checked. |
| invalid file naming | PASS | Game-specific filenames are blocked from generic reusable lanes. |
| duplicate registrations | PASS | No duplicate lane registrations. |
| invalid imports | PASS | Relative imports checked by Playwright structure audit. |
| unresolved fixtures | PASS | No unresolved fixture findings. |
| unresolved helpers | PASS | Shared helper imports and naming ownership checked. |
| targeted file manifests | PASS | tool-display-mode:PASS |
| persistent lane manifests | PASS | tool-display-mode:REUSED |
| lane warm-start reuse | PASS | tool-display-mode:REUSED |
| dependency hydration reuse | PASS | tool-display-mode:REUSED |
| lane snapshots | PASS | tool-display-mode:REUSED |
| manifest input graph expansion | PASS | No scoped discovery inputs escaped manifest ownership. |
| scoped discovery | PASS | Targets: dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs; helpers: dev/tests/helpers/playwrightRepoServer.mjs, dev/tests/helpers/playwrightStorageIsolation.mjs, dev/tests/helpers/playwrightV8CoverageReporter.mjs, dev/tests/helpers/workspaceV2CoverageReporter.mjs. |
| invalid grep patterns | PASS | No invalid grep patterns. |
| Windows quoting hazards | PASS | No shell quoting hazards. |
| invalid lane references | PASS | No invalid lane references. |
| invalid lane configuration | PASS | See dev/reports/lane_compilation_report.md. |
| deterministic dependency graph | PASS | See dev/reports/dependency_gating_report.md. |
| conflicting reusable helper ownership | PASS | Shared helper filenames checked against known game names. |

## Corrected Ownership Drift

- Asteroids Playwright runtime specs are enforced under `dev/tests/playwright/games`.
- Game index preview manifest handoff is enforced under `dev/tests/playwright/integration`.
- Tool-owned specs may reference games only as documented explicit fixtures.

## Runtime Savings Observations

- This preflight runs through Node-only validation before Playwright CLI startup.
- Browser launch is blocked on deterministic setup failure.
- Workspace V2, broad lane scheduling, and samples smoke are not started by preflight.
- Invalid targeted lane setup cannot escalate into full-lane reruns.
