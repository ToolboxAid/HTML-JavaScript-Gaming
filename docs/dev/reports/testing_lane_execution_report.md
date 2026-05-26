# Testing Lane Execution Report

Generated: 2026-05-26
PR: PR_26146_027-static-validation-before-playwright-launch

## Summary

PASS: 3
WARN: 0
FAIL: 0
SKIP: 3

## Full Samples Smoke

Status: SKIP
Reason: This PR changes static validation, structural preflight routing, and targeted lane execution only. No sample JSON, shared sample loader, or sample framework files were changed.

## Executed and Skipped Lanes

| Lane / Check | Status | Executed/Skipped Reason | Affected Surface | Evidence |
| --- | --- | --- | --- | --- |
| static-validation | PASS | Executed first to prove deterministic checks run before browser startup. | Placement, ownership, filenames, lane targets, fixtures, imports, grep, quoting, duplicate registrations | `npm run test:playwright:static` passed and wrote `docs/dev/reports/static_validation_report.md`. |
| tool-runtime | PASS | Executed because runner static validation and Playwright invocation behavior changed. | Asset Manager V2, Preview Generator V2, Collision Inspector V2 runtime tests | `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lanes integration,tool-runtime`; Asset Manager focused subset 5 passed, Preview Generator and Collision Inspector combined run 11 passed. |
| integration | PASS | Executed because the integration lane target remains part of the affected Playwright routing surface. | Game index preview manifest handoff | Same combined runner command; focused Pong handoff subset 3 passed. |
| workspace-contract | SKIP | Skipped because static validation does not require Workspace V2 launch and Workspace V2 wiring was not changed. | Workspace Manager V2 contract/lifecycle behavior | Not run. |
| engine-src | SKIP | Skipped because no `src/`, engine Playwright, or node engine lane targets changed. | src/ engine/shared runtime behavior | Not run. |
| samples | SKIP | Skipped because samples are on-request or affected-sample only and this PR did not impact samples. | On-request samples lane | Not run. |

## Prevented Launches and Fast-Fail Reasons

- Prevented launches: 0 in this validation run because no deterministic static failures were found.
- Fast-fail reasons: none.
- If static validation finds placement, import, fixture, lane target, duplicate registration, grep, or quoting failures, the runner exits before Playwright/browser startup.

## Placement and Helper Cleanup

- Existing placement corrections remain enforced in `docs/dev/reports/playwright_structure_audit.md`.
- No additional misplaced tests or game-specific reusable helper names were found.
- `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` remains the integration-owned handoff target.

## Runtime Savings Observations

- Static validation ran once as a standalone gate before affected lanes.
- Affected lanes ran together in one Node lane-runner process instead of separate npm launches.
- Preview Generator V2 and Collision Inspector V2 execute through one Playwright CLI invocation.
- Workspace V2, engine/src, samples, and full samples smoke were not started.

## Static Validation

- PASS `node --check scripts/run-targeted-test-lanes.mjs`
- PASS `node --check scripts/audit-playwright-test-locations.mjs`
- PASS `node --check tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs`
