# Targeted Testing Workflow Closeout

PR: PR_26146_040-targeted-testing-workflow-closeout
Generated: 2026-05-26
Status: PASS with one known scoped game-runtime failure

## Closeout Summary

The targeted testing workflow now defaults to narrow execution. No-lane execution stays zero-browser, broad execution requires explicit opt-in, lane ownership is checked before Playwright startup, and deterministic setup failures stop before runtime launch.

Representative workflow validation covered:
- docs-only change: zero-browser/static only
- tool-only change: `tool-runtime`
- game-only change: `game-runtime`
- src-only change: `engine-src`
- integration-only change: `integration`

Full Workspace was not rerun for this closeout because PR_26146_039 already validated the command compatibility redirect from `npm run test:workspace-v2` to `workspace-contract`; the remaining Workspace failures were documented as unrelated known failures. Full samples smoke was skipped because no sample JSON or shared sample loader/framework behavior changed.

## Validated Workflow Matrix

| Workflow | Command | Result | Executed Lanes | Skipped Lanes | Browser Launches | Runtime Observation |
| --- | --- | --- | --- | --- | --- | --- |
| docs-only | `node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only` | PASS | none | all runtime lanes | 0 | No runtime scheduling; no Playwright launch. |
| tool-only | `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime` | PASS | tool-runtime | workspace-contract, game-runtime, integration, engine-src, samples | 2 | 16 Playwright tests passed in 76.25s. |
| game-only | `node ./scripts/run-targeted-test-lanes.mjs --lane game-runtime` | FAIL scoped | game-runtime | workspace-contract, tool-runtime, integration, engine-src, samples | 1 | 5 passed, 1 known Asteroids visual-state failure; no broad rerun. |
| src-only | `node ./scripts/run-targeted-test-lanes.mjs --lane engine-src` | PASS | engine-src | workspace-contract, tool-runtime, game-runtime, integration, samples | 0 | 11/11 targeted Node test files passed in 1.00s. |
| integration-only | `node ./scripts/run-targeted-test-lanes.mjs --lane integration` | PASS | integration | workspace-contract, tool-runtime, game-runtime, engine-src, samples | 1 | 3 Playwright integration tests passed in 11.88s. |
| deterministic setup failure | `node ./scripts/run-targeted-test-lanes.mjs --lane invalid-targeted-closeout-lane` | FAIL expected | none | all runtime lanes | 0 | Unknown lane failed before Playwright/browser startup; reruns and broad escalation were suppressed. |

## Monolith Cleanup Verification

| Check | Status | Evidence |
| --- | --- | --- |
| Accidental broad execution paths removed or documented | PASS | `run-targeted-test-lanes.mjs` no longer defaults to all lanes; `--all` remains explicit opt-in. |
| Targeted execution remains default | PASS | No-lane zero-browser run scheduled no runtime lanes. |
| Deterministic failures stop before Playwright/browser startup | PASS | Invalid-lane probe produced 0 browser launches and 0 executed lanes. |
| Lane ownership enforcement remains active | PASS | Playwright lanes ran `scripts/audit-playwright-test-locations.mjs` before runtime. |
| Discovery scope restrictions remain active | PASS | Tool, game, and integration runs reported scoped targets/helpers/fixtures only. |
| Manifest reuse remains active | PASS | Tool, game, src, and integration lanes reported persistent manifest reuse. |
| Snapshot reuse remains active | PASS | Tool, game, src, and integration lanes reported lane snapshot reuse. |
| Full Workspace stays explicit/on-request | PASS | Workspace lane skipped in representative non-Workspace workflows. |
| Full samples smoke stays explicit/on-request | PASS | Samples lane skipped in all representative workflows. |

## New Normal Targeted Commands

Use zero-browser/static checks first:
- `npm run test:playwright:zero-browser`
- `node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only`

Use affected lanes only:
- docs/workflow only: zero-browser/static checks plus review artifacts
- tool runtime/UI/toolState behavior: `npm run test:lane:tool-runtime`
- game-owned Playwright behavior: `npm run test:lane:game-runtime`
- reusable `src/` runtime behavior: `npm run test:lane:engine-src`
- cross-surface handoff behavior: `npm run test:lane:integration`
- Workspace contract/lifecycle behavior: `npm run test:lane:workspace-contract` or `npm run test:workspace-v2`
- affected samples only: `npm run test:lane:samples`

Broad execution:
- `node ./scripts/run-targeted-test-lanes.mjs --all` is explicit opt-in only.
- Full samples smoke remains manual/on-request unless sample JSON, shared sample loading, or broad sample runtime behavior is in scope.

## Lane Selection Rules

Run Workspace lane when a PR changes Workspace Manager V2 launch, manifest handoff, palette propagation, toolState open/save contracts, dirty-state handling, or Workspace lifecycle behavior.

Run engine/src lane when a PR changes reusable `src/` runtime, rendering, audio, input, timing, asset loading, parser, or shared validation behavior.

Run integration lane when a PR changes an explicit cross-surface handoff, including workspace-to-tool launch, manifest handoff, palette propagation, or toolState open/save interactions across owners.

Run full samples only when explicitly requested or when changed files broadly affect sample loading/shared sample framework behavior. Do not run samples as an implicit gate for tool, game, engine, or docs-only PRs.

## Known Intentionally Expensive Tests

| Lane | Test | Latest Observation |
| --- | --- | --- |
| tool-runtime | Asset Manager V2 temporary UAT context | 12.20s in closeout tool-only run; 19.10s in PR_26146_038 evidence. |
| tool-runtime | Preview Generator V2 controls/status workflow | 7.00s in closeout tool-only run. |
| tool-runtime | Collision Inspector V2 live vector/pixel/bounds/hybrid collision workflow | 6.50s in closeout tool-only run. |
| tool-runtime | Preview Generator V2 real batch output | 6.00s in closeout tool-only run; 10.10s in PR_26146_038 evidence. |
| integration | Pong thumbnail/preview manifest handoff | 2.10s in closeout integration-only run; 14.50s in PR_26146_038 evidence. |
| game-runtime | Asteroids ship visual states | Known scoped failure: expected `destroyed`, received `idle`, `move`. |

## Before / After Observations

| Observation | Before Cleanup Evidence | Closeout Evidence |
| --- | --- | --- |
| Representative targeted runtime | PR_26146_038 measured 169.71s for the cleanup run. | Closeout representative lane total was 112.25s across tool, game, src, and integration cases. |
| No-lane runner behavior | No-lane runner previously defaulted into all lanes. | No-lane zero-browser run scheduled none. |
| Browser launches | Broad defaults could trigger unnecessary browser startup. | Docs-only and src-only launched 0 browsers; tool/game/integration launched only their selected lane browsers. |
| Workspace startup | Workspace script previously bypassed lane preflight. | `test:workspace-v2` is routed through `workspace-contract`; not rerun in this PR. |
| Deterministic setup failure | Invalid setup could risk runtime discovery. | Invalid lane failed pre-runtime with 0 browser launches and 4 broad escalations suppressed. |

## Expected Operational Behavior Going Forward

Targeted execution is the default. A PR report should state which lane ran, why it ran, which lanes were skipped, why samples were skipped or included, and whether any failure is scoped to the selected lane. Unrelated lane failures must not trigger automatic Workspace, samples, or all-lane reruns.
