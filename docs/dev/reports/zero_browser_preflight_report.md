# Zero-Browser Preflight Report

Generated: 2026-05-26T21:52:45.139Z
Status: FAIL

## Prevented Browser Launches

Count: 1
Reason: Deterministic pre-runtime failures were found.

## Deterministic Failures Caught Pre-Runtime

- Unknown lane requested: invalid-targeted-closeout-lane
- Unknown lane requested before dependency gating: invalid-targeted-closeout-lane
- Lane compilation failed; dependency-gated runtime scheduling is blocked.

## Validation Coverage

| Check | Status | Details |
| --- | --- | --- |
| lane ownership | SKIP | No selected lane requires Playwright structure audit. |
| directory placement | SKIP | tools/games/integration/engine ownership checked. |
| invalid file naming | SKIP | Game-specific filenames are blocked from generic reusable lanes. |
| duplicate registrations | PASS | No duplicate lane registrations. |
| invalid imports | SKIP | Relative imports checked by Playwright structure audit. |
| unresolved fixtures | PASS | No unresolved fixture findings. |
| unresolved helpers | SKIP | Shared helper imports and naming ownership checked. |
| targeted file manifests | SKIP | none |
| persistent lane manifests | SKIP | none |
| lane warm-start reuse | SKIP | none |
| dependency hydration reuse | SKIP | none |
| lane snapshots | SKIP | none |
| manifest input graph expansion | PASS | No scoped discovery inputs escaped manifest ownership. |
| scoped discovery | PASS | Targets: none; helpers: none. |
| invalid grep patterns | PASS | No invalid grep patterns. |
| Windows quoting hazards | PASS | No shell quoting hazards. |
| invalid lane references | FAIL | invalid-targeted-closeout-lane |
| invalid lane configuration | FAIL | See docs/dev/reports/lane_compilation_report.md. |
| deterministic dependency graph | FAIL | See docs/dev/reports/dependency_gating_report.md. |
| conflicting reusable helper ownership | SKIP | Shared helper filenames checked against known game names. |

## Corrected Ownership Drift

- Asteroids Playwright runtime specs are enforced under `tests/playwright/games`.
- Game index preview manifest handoff is enforced under `tests/playwright/integration`.
- Tool-owned specs may reference games only as documented explicit fixtures.

## Runtime Savings Observations

- This preflight runs through Node-only validation before Playwright CLI startup.
- Browser launch is blocked on deterministic setup failure.
- Workspace V2, broad lane scheduling, and samples smoke are not started by preflight.
- Invalid targeted lane setup cannot escalate into full-lane reruns.
