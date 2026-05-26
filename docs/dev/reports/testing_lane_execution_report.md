# Testing Lane Execution Report

Generated: 2026-05-26
PR: PR_26146_028-zero-browser-preflight-and-lane-compilation

## Summary

PASS: 3
WARN: 0
FAIL: 0
SKIP: 3

## Full Samples Smoke

Status: SKIP
Reason: This PR changes zero-browser preflight, lane compilation, and targeted lane routing only. No sample JSON, shared sample loader, or sample framework files were changed.

## Executed and Skipped Lanes

| Lane / Check | Status | Executed/Skipped Reason | Affected Surface | Evidence |
| --- | --- | --- | --- | --- |
| zero-browser-preflight | PASS | Executed first to prove deterministic setup checks run before Playwright runtime initialization. | Placement, ownership, registrations, imports, fixtures, helpers, grep, quoting, lane references, lane configuration | `npm run test:playwright:zero-browser` passed and wrote zero-browser plus lane compilation reports. |
| tool-runtime | PASS | Executed because lane compilation and zero-browser routing changed. | Asset Manager V2, Preview Generator V2, Collision Inspector V2 runtime tests | `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lanes integration,tool-runtime`; Asset Manager focused subset 5 passed, Preview Generator and Collision Inspector combined run 11 passed. |
| integration | PASS | Executed because the integration lane remains part of the affected compiled lane graph. | Game index preview manifest handoff | Same combined runner command; focused Pong handoff subset 3 passed. |
| workspace-contract | SKIP | Skipped because zero-browser preflight does not require Workspace V2 launch and Workspace V2 runtime wiring was not changed. | Workspace Manager V2 contract/lifecycle behavior | Not run. |
| engine-src | SKIP | Skipped because no `src/`, engine Playwright, or node engine lane targets changed. | src/ engine/shared runtime behavior | Not run. |
| samples | SKIP | Skipped because samples are on-request or affected-sample only and this PR did not impact samples. | On-request samples lane | Not run. |

## Prevented Launches and Fast-Fail Reasons

- Prevented browser launches: 0 in this validation run because no deterministic pre-runtime failures were found.
- Fast-fail reasons: none.
- If preflight finds placement, helper ownership, import, fixture, lane reference, lane configuration, grep, or quoting failures, the runner exits before Playwright/browser startup.

## Corrected Ownership Drift

- No new misplaced tests or helpers were found in this PR.
- Existing corrections remain enforced: Asteroids game specs under `tests/playwright/games`, integration handoff under `tests/playwright/integration`, documented game fixtures only in tool tests.

## Runtime Savings Observations

- Zero-browser preflight ran before browser startup.
- Affected lanes ran in one Node lane-runner process.
- Preview Generator V2 and Collision Inspector V2 ran through one Playwright CLI invocation.
- Workspace V2, engine/src, samples, and full samples smoke were not started.

## Static Validation

- PASS `node --check scripts/run-targeted-test-lanes.mjs`
- PASS `node --check scripts/audit-playwright-test-locations.mjs`
