# Test Cleanup Routing Report

Generated: 2026-05-31T22:24:47.378Z
Status: PASS

## Representative Routing Cases

| Case | Changed Files | Expected Lanes | Actual Lanes | Status | Reason |
| --- | --- | --- | --- | --- | --- |
| docs-only change | docs/dev/PROJECT_INSTRUCTIONS.md | none | none | PASS | Docs/workflow-only changes use static review evidence; runtime lanes, Workspace V2, and samples stay explicit/on-request. |
| tool change | tools/audio-sfx-playground-v2/index.js | tool-runtime | tool-runtime | PASS | Tool-owned runtime/UI changes route to the affected tool-runtime lane only. |
| game change | games/asteroids/asteroids.js | game-runtime | game-runtime | PASS | Game-owned runtime changes route to game-runtime without treating tool lanes as blockers. |
| src change | src/input/InputMap.js | engine-src | engine-src | PASS | Reusable src/ capability changes route to engine-src validation first. |
| integration change | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | integration | integration | PASS | Cross-surface handoff coverage routes to the integration lane only. |

## Explicit Broad-Lane Guards

Workspace V2 explicit/on-request only: PASS
Full samples smoke explicit/on-request only: PASS
Misplaced test preflight fast-fail: PASS
Scheduled runtime lanes: none
Full samples smoke decision: SKIP - Skipped during pre-runtime validation because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Lane Script Routing

| Script | Status | Command |
| --- | --- | --- |
| test:lane:workspace-contract | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane workspace-contract |
| test:lane:tool-runtime | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime |
| test:lane:game-runtime | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane game-runtime |
| test:lane:integration | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane integration |
| test:lane:engine-src | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane engine-src |
| test:lane:samples | PASS | node ./scripts/run-targeted-test-lanes.mjs --lane samples --include-samples |

## Legacy Direct Playwright Scripts

| Script | Status | Command |
| --- | --- | --- |
| none | INFO | No direct Playwright scripts were found outside targeted lane scripts. |

## Misplaced Test Probe

- Lane tool-runtime has no scoped manifest target.
- Scoped discovery target is outside selected lane ownership: tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs.

## Routing Findings

No routing findings. Targeted lanes execute only expected representative lanes, and broad Workspace/samples paths remain explicit.

## Enforcement Notes

- Representative docs, tool, game, src, and integration cases route through deterministic lane rules.
- Old direct Playwright scripts may remain available, but test:lane:* scripts route through the targeted Node lane runner.
- Misplaced ownership probes fail in zero-browser scoped discovery before Playwright/browser launch.
- Full Workspace and full samples smoke are not used as accidental fallback lanes.
