# Zero-Browser Preflight Report

Generated: 2026-05-26T22:55:37.503Z
Status: PASS

## Prevented Browser Launches

Count: 0
Reason: No deterministic pre-runtime failures were found.

## Deterministic Failures Caught Pre-Runtime

No deterministic setup failures.

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
| targeted file manifests | PASS | engine-src:PASS |
| persistent lane manifests | PASS | engine-src:INVALIDATED |
| lane warm-start reuse | PASS | engine-src:INVALIDATED |
| dependency hydration reuse | PASS | engine-src:INVALIDATED |
| lane snapshots | PASS | engine-src:INVALIDATED |
| manifest input graph expansion | PASS | No scoped discovery inputs escaped manifest ownership. |
| scoped discovery | PASS | Targets: tests/assets/AssetLoaderSystem.test.mjs, tests/audio/AudioService.test.mjs, tests/core/EngineCoreBoundaryBaseline.test.mjs, tests/core/FixedTicker.test.mjs, tests/core/FrameClock.test.mjs, tests/input/GamepadHapticsService.test.mjs, tests/input/GamepadInputAdapter.test.mjs, tests/input/InputMap.test.mjs, tests/input/KeyboardState.test.mjs, tests/input/MouseState.test.mjs, tests/render/Renderer.test.mjs; helpers: none. |
| invalid grep patterns | PASS | No invalid grep patterns. |
| Windows quoting hazards | PASS | No shell quoting hazards. |
| invalid lane references | PASS | No invalid lane references. |
| invalid lane configuration | PASS | See docs/dev/reports/lane_compilation_report.md. |
| deterministic dependency graph | PASS | See docs/dev/reports/dependency_gating_report.md. |
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
