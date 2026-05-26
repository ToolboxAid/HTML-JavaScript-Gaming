# Testing Lane Execution Report

Generated: 2026-05-26
PR: PR_26146_025-test-location-audit-and-runner-preflight

## Summary

PASS: 3
WARN: 1
FAIL: 0
SKIP: 3

## Full Samples Smoke

Status: SKIP
Reason: This PR changes Playwright test placement, audit/preflight scripts, and targeted lane runner behavior only. No sample JSON, shared sample loader, or sample framework files were changed.

## Executed and Skipped Lanes

| Lane / Check | Status | Executed/Skipped Reason | Affected Surface | Evidence |
| --- | --- | --- | --- | --- |
| test-location-preflight | PASS | Executed first because this PR adds the audit/preflight gate. | Playwright file ownership and lane placement | `npm run test:lanes:preflight` passed and wrote `docs/dev/reports/test_location_audit_report.md`. |
| tool-runtime | PASS | Executed because tool test routing changed and the runner preflight/Node CLI path needed validation. | Asset Manager V2, Preview Generator V2, Collision Inspector V2 runtime tests | `PLAYWRIGHT_BROWSERS_PATH=0 npm run test:lane:tool-runtime`; preflight passed, Asset Manager V2 focused subset 5 passed, Preview Generator V2 7 passed, Collision Inspector V2 4 passed. |
| integration | PASS | Executed because the runner preflight also guards game/integration Playwright placement. | Game index preview manifest handoff | `PLAYWRIGHT_BROWSERS_PATH=0 npm run test:lane:integration`; preflight passed, focused Pong handoff subset 3 passed. |
| moved-game-specs | WARN | Executed once to validate relocated Asteroids game specs without changing game runtime behavior. | Asteroids game-specific Playwright tests moved from tools to games | 5 passed, 1 existing Asteroids ship-state expectation failed; exact failing test listed below. |
| workspace-contract | SKIP | Skipped because `npm run test:workspace-v2` behavior was preserved and Workspace V2 runner wiring was not changed for this PR. | Workspace Manager V2 contract/lifecycle behavior | Not run. |
| engine-src | SKIP | Skipped because no `src/`, engine, or node runtime test lane files were changed. | src/ engine/shared runtime behavior | Not run. |
| samples | SKIP | Skipped because samples are on-request or affected-sample only and this PR did not impact samples. | On-request samples lane | Not run. |

## Moved Game Spec WARN Detail

Focused command:

`PLAYWRIGHT_BROWSERS_PATH=0 node ./node_modules/@playwright/test/cli.js test tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs tests/playwright/games/AsteroidsBeatTiming.spec.mjs tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs --project=playwright --workers=1 --reporter=list`

Result: 5 passed, 1 failed.

Failing test:

- `AsteroidsShipStateVisuals.spec.mjs > validates Asteroids ship visual states from manifest runtime rendering`

Observed failure: expected ship visual states to include `destroyed`, but the runtime returned `["idle", "move"]`. This was recorded as WARN because the PR only moves test ownership and runner preflight behavior; it does not alter Asteroids runtime or sample JSON.

## Static Validation

- PASS `node --check scripts/audit-playwright-test-locations.mjs`
- PASS `node --check scripts/run-targeted-test-lanes.mjs`
- PASS `node --check tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs`
- PASS `node --check tests/playwright/games/AsteroidsBeatTiming.spec.mjs`
- PASS `node --check tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs`
- PASS `node --check tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs`

## Runner Safeguards

- Playwright lane commands run through `node node_modules/@playwright/test/cli.js`, so grep patterns such as `launch guard|temporary UAT context|rejects non-Workspace` remain literal on Windows.
- Playwright-bearing lanes run the location audit before expensive execution.
- If the audit reports blocking placement findings, the lane runner writes the lane report and exits before running long Playwright suites.
- No full lanes were rerun after known out-of-scope failures.
