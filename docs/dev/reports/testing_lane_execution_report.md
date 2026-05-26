# Testing Lane Execution Report

PR: PR_26146_040-targeted-testing-workflow-closeout
Generated: 2026-05-26
Dry run: No

## Summary

Representative targeted workflows were validated end to end after zero-browser preflight.

PASS cases: docs-only, tool-only, src-only, integration-only, deterministic setup failure probe
Scoped FAIL case: game-only, known Asteroids ship visual states assertion
Full Workspace: SKIP, command compatibility was already verified in PR_26146_039 and no Workspace contract changed in this closeout
Full samples smoke: SKIP, no sample JSON or shared sample loader/framework behavior changed

## Workflow Results

| Case | Status | Command | Executed Lanes | Skipped Lanes | Browser Launches | Prevented Broad Execution | Prevented Reruns | Runtime Observation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zero-browser/docs-only | PASS | `node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only` | none | all runtime lanes | 0 | Yes | none needed | Static/zero-browser checks only; no runtime scheduling. |
| tool-only | PASS | `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime` | tool-runtime | workspace-contract, game-runtime, integration, engine-src, samples | 2 | Yes | none needed | 16 Playwright tests passed in 76.25s. |
| game-only | FAIL scoped | `node ./scripts/run-targeted-test-lanes.mjs --lane game-runtime` | game-runtime | workspace-contract, tool-runtime, integration, engine-src, samples | 1 | Yes | Yes | 5 passed, 1 known Asteroids destroyed-state failure in 23.12s; no fallback lanes. |
| src-only | PASS | `node ./scripts/run-targeted-test-lanes.mjs --lane engine-src` | engine-src | workspace-contract, tool-runtime, game-runtime, integration, samples | 0 | Yes | none needed | 11/11 targeted Node test files passed in 1.00s. |
| integration-only | PASS | `node ./scripts/run-targeted-test-lanes.mjs --lane integration` | integration | workspace-contract, tool-runtime, game-runtime, engine-src, samples | 1 | Yes | none needed | 3 Playwright tests passed in 11.88s. |
| deterministic setup failure | PASS expected fail | `node ./scripts/run-targeted-test-lanes.mjs --lane invalid-targeted-closeout-lane` | none | all runtime lanes | 0 | Yes | 4 suppressed | Invalid lane failed before runtime; broad escalation was suppressed 4 times. |

## Lane Reuse Evidence

| Lane | Manifest Reuse | Snapshot Reuse | Warm Start Reuse | Dependency Hydration Reuse |
| --- | --- | --- | --- | --- |
| tool-runtime | REUSED | REUSED | REUSED | REUSED |
| game-runtime | REUSED | REUSED | REUSED | REUSED |
| engine-src | REUSED | REUSED | REUSED | REUSED |
| integration | REUSED | REUSED | REUSED | REUSED |

## Lane Ownership And Discovery Scope

| Check | Result |
| --- | --- |
| Tool lane ownership | PASS, tool targets stayed under `tests/playwright/tools`. |
| Game lane ownership | PASS, game targets stayed under `tests/playwright/games`. |
| Integration lane ownership | PASS, integration target stayed under `tests/playwright/integration`. |
| Src lane ownership | PASS, targeted Node tests stayed under engine/src-owned test buckets. |
| Discovery expansion | PASS, no representative lane widened into broad Playwright discovery. |
| Full Workspace escalation | PASS, Workspace lane stayed skipped unless explicitly requested. |
| Full samples escalation | PASS, samples stayed skipped and full samples smoke was not run. |

## Known Scoped Failure

| Lane | Test | Actual | Expected | Scope |
| --- | --- | --- | --- | --- |
| game-runtime | `tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs:14:1` | `["idle", "move"]` | array containing `["idle", "move", "destroyed"]` | Known game-runtime failure; did not block other targeted lanes. |

## Commands Run

- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only`
- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime`
- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane game-runtime`
- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane engine-src`
- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane integration`
- `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane invalid-targeted-closeout-lane`

## Expected Workflow Going Forward

Run zero-browser/static validation first, then run only the affected lane. Do not run Workspace, samples, or all lanes unless the PR explicitly changes those surfaces or requests broad validation. Deterministic setup failures are blockers for the selected lane setup only and must stop before Playwright/browser launch.
