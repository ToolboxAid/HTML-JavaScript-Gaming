# Targeted Testing Examples Report

PR: PR_26146_040-targeted-testing-workflow-closeout
Generated: 2026-05-26
Status: PASS with known scoped game-runtime failure

## Representative Targeted Workflows

| Case | Representative Change | Command | Executed Lanes | Skipped Lanes | Browser Launches | Prevented Broad Execution | Prevented Reruns | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| docs-only change | `docs_build/dev/PROJECT_INSTRUCTIONS.md` | `node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only` | none | all runtime lanes | 0 | Yes; no runtime scheduling. | none needed | PASS |
| tool-only change | `tools/audio-sfx-playground-v2/index.js` | `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime` | tool-runtime | workspace-contract, game-runtime, integration, engine-src, samples | 2 | Yes; only tool-runtime scheduled. | none needed | PASS |
| game-only change | `games/asteroids/asteroids.js` | `node ./scripts/run-targeted-test-lanes.mjs --lane game-runtime` | game-runtime | workspace-contract, tool-runtime, integration, engine-src, samples | 1 | Yes; only game-runtime scheduled. | Yes; no retry or broad fallback after scoped failure. | FAIL scoped |
| src-only change | `src/input/InputMap.js` | `node ./scripts/run-targeted-test-lanes.mjs --lane engine-src` | engine-src | workspace-contract, tool-runtime, game-runtime, integration, samples | 0 | Yes; Node-only lane. | none needed | PASS |
| integration-only change | `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` | `node ./scripts/run-targeted-test-lanes.mjs --lane integration` | integration | workspace-contract, tool-runtime, game-runtime, engine-src, samples | 1 | Yes; only integration scheduled. | none needed | PASS |

## Runtime Observations By Case

### Docs-Only

- Zero-browser preflight passed.
- No runtime lanes were scheduled.
- Full Workspace and full samples remained skipped.
- Use for documentation/workflow-only PRs when no runtime behavior changed.

### Tool-Only

- Preflight: PASS
- Runtime scheduling: PASS
- Total lane elapsed time: 76.25s
- Browser launches: 2
- Reused lane snapshots: 1
- Reused warm-start lanes: 1
- Reused dependency hydration: 1
- Prevented redundant lane execution: 5
- Slowest tests: Asset Manager V2 temporary UAT context at 12.20s; Preview Generator V2 control workflow at 7.00s; Collision Inspector V2 collision workflow at 6.50s.

### Game-Only

- Preflight: PASS
- Runtime scheduling: PASS
- Total lane elapsed time: 23.12s
- Browser launches: 1
- Reused lane snapshots: 1
- Reused warm-start lanes: 1
- Reused dependency hydration: 1
- Prevented redundant lane execution: 5
- Failure: `tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs:14:1` expected visual states containing `destroyed`, received `idle`, `move`.
- The failure stayed scoped to game-runtime; no tool, Workspace, integration, engine, samples, retry, or broad escalation ran.

### Src-Only

- Preflight: SKIP, because selected lane is Node-only.
- Runtime scheduling: PASS
- Total lane elapsed time: 1.00s
- Browser launches: 0
- Reused lane snapshots: 1
- Reused warm-start lanes: 1
- Reused dependency hydration: 1
- 11/11 targeted Node test files passed.

### Integration-Only

- Preflight: PASS
- Runtime scheduling: PASS
- Total lane elapsed time: 11.88s
- Browser launches: 1
- Reused lane snapshots: 1
- Reused warm-start lanes: 1
- Reused dependency hydration: 1
- Prevented redundant lane execution: 5
- 3/3 Pong manifest preview handoff tests passed.

## Deterministic Failure Example

Command: `node ./scripts/run-targeted-test-lanes.mjs --lane invalid-targeted-closeout-lane`

| Check | Result |
| --- | --- |
| Expected result | FAIL before runtime |
| Preflight status | FAIL |
| Executed lanes | none |
| Browser launches | 0 |
| Deterministic setup failures | 4 |
| Prevented reruns | 4 |
| Prevented broad lane escalation | 4 |
| Failure reason | Unknown lane requested before dependency gating. |

This validates the no-wasted-launch rule: deterministic setup failures do not start Playwright, browsers, Workspace, samples, or fallback broad lanes.

## Command Selection Examples

| PR Surface | Default Command | Run Workspace? | Run Samples? |
| --- | --- | --- | --- |
| docs/workflow only | `npm run test:playwright:zero-browser` | No | No |
| one first-class tool | `npm run test:lane:tool-runtime` | Only if Workspace lifecycle changed | No |
| one game runtime | `npm run test:lane:game-runtime` | No | No |
| `src/` shared runtime | `npm run test:lane:engine-src` | Only if dependent Workspace contract changed | No |
| cross-surface handoff | `npm run test:lane:integration` | Only if Workspace contract is the changed surface | No |
| Workspace manifest/toolState lifecycle | `npm run test:lane:workspace-contract` | Yes | No |
| sample loader/framework | `npm run test:lane:samples` | Only if handoff also changed | Yes, when explicitly in scope |
