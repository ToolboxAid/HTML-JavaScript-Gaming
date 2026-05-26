# Zero-Browser Preflight Report

Generated: 2026-05-26
PR: PR_26146_028-zero-browser-preflight-and-lane-compilation

## Summary

Status: PASS
Prevented browser launches: 0
Deterministic failures caught pre-runtime: none

## Runs

| Command | Status | Browser Launch | Reason |
| --- | --- | --- | --- |
| `npm run test:playwright:zero-browser` | PASS | No | Required first pass. Ran lane ownership, structure, lane registration, import, fixture, grep, quoting, and lane compilation checks without starting Playwright. |
| `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lanes integration,tool-runtime` | PASS | Yes, after preflight | Re-ran zero-browser validation before selected affected lanes executed. |

## Deterministic Checks

| Check | Status | Details |
| --- | --- | --- |
| lane ownership | PASS | Selected lane targets resolve inside their owning lane directories. |
| directory placement | PASS | Playwright specs are separated into tools, games, integration, and optional engine buckets. |
| invalid file naming | PASS | No game-specific reusable helper or tool-lane filename drift was found. |
| duplicate registrations | PASS | No duplicate `test:lane:*` npm registrations were found. |
| invalid imports | PASS | Relative imports in Playwright specs and shared helpers resolve. |
| unresolved fixtures | PASS | Required fixture paths resolve before execution. |
| unresolved helpers | PASS | Shared helper imports resolve and helper names stay generic. |
| invalid grep patterns | PASS | No empty or malformed grep values were found. |
| Windows quoting hazards | PASS | Shell-sensitive grep pipes are passed through Node CLI argv, not shell parsing. |
| invalid lane references | PASS | Requested lane names resolve in `laneDefinitions`. |
| invalid lane configuration | PASS | See `docs/dev/reports/lane_compilation_report.md`. |
| conflicting reusable helper ownership | PASS | Shared helper filenames were checked against known game names. |

## Corrected Ownership Drift

- Asteroids Playwright runtime specs remain enforced under `tests/playwright/games`.
- Game index preview manifest handoff remains enforced under `tests/playwright/integration`.
- Tool-owned specs may reference games only as documented explicit fixtures.

## Runtime Savings Observations

- Zero-browser preflight runs through Node-only validation before Playwright CLI startup.
- Deterministic setup failures would block browser launch, Workspace V2 startup, lane execution, and automatic retries.
- Affected runtime validation used one lane-runner process for `integration,tool-runtime`.
- Full samples smoke, Workspace V2, and engine/src lanes were not started.
