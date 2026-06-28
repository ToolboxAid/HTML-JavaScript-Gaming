# Test Cleanup Routing Report

Generated: 2026-06-28T14:20:59.081Z
Status: PASS

## Representative Routing Cases

| Case | Changed Files | Expected Lanes | Actual Lanes | Status | Reason |
| --- | --- | --- | --- | --- | --- |
| docs-only change | dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md | none | none | PASS | Docs/workflow-only changes use static review evidence; runtime lanes, Workspace V2, and samples stay explicit/on-request. |
| tool change | toolbox/audio-sfx-playground-v2/index.js | tool-runtime | tool-runtime | PASS | Tool-owned runtime/UI changes route to the affected tool-runtime lane only. |
| deprecated game change | dev/archive/v1-v2/games/asteroids/asteroids.js | none | none | PASS | Deprecated dev/archive/v1-v2/games changes do not route to active runtime test lanes. |
| src change | src/input/InputMap.js | engine-src | engine-src | PASS | Reusable src/ capability changes route to engine-src validation first. |
| active toolbox Playwright change | dev/tests/playwright/tools/RootToolsFutureState.spec.mjs | tool-runtime | tool-runtime | PASS | Active toolbox Playwright coverage routes to the tool-runtime lane only. |

## Explicit Broad-Lane Guards

Workspace V2 explicit/on-request only: PASS
Full samples smoke explicit/on-request only: PASS
Misplaced test preflight fast-fail: PASS
Scheduled runtime lanes: tool-display-mode
Full samples smoke decision: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Lane Script Routing

| Script | Status | Command |
| --- | --- | --- |
| test:lane:workspace-contract | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane workspace-contract |
| test:lane:build-path | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane build-path |
| test:lane:tools-progress | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane tools-progress |
| test:lane:tool-navigation | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane tool-navigation |
| test:lane:tool-display-mode | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane tool-display-mode |
| test:lane:tool-images | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane tool-images |
| test:lane:game-configuration | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane game-configuration |
| test:lane:game-design | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane game-design |
| test:lane:game-hub | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane game-hub |
| test:lane:tool-runtime | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane tool-runtime |
| test:lane:game-runtime | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane game-runtime |
| test:lane:integration | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane integration |
| test:lane:engine-src | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane engine-src |
| test:lane:samples | PASS | node ./dev/scripts/run-targeted-test-lanes.mjs --lane samples --include-samples |

## Legacy Direct Playwright Scripts

| Script | Status | Command |
| --- | --- | --- |
| none | INFO | No direct Playwright scripts were found outside targeted lane scripts. |

## Misplaced Test Probe

- Lane tool-runtime has no scoped manifest target.
- Scoped discovery target is outside selected lane ownership: dev/tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs.

## Routing Findings

No routing findings. Targeted lanes execute only expected representative lanes, and broad Workspace/samples paths remain explicit.

## Enforcement Notes

- Representative docs, tool, game, src, and integration cases route through deterministic lane rules.
- Old direct Playwright scripts may remain available, but test:lane:* scripts route through the targeted Node lane runner.
- Misplaced ownership probes fail in zero-browser scoped discovery before Playwright/browser launch.
- Full Workspace and full samples smoke are not used as accidental fallback lanes.
