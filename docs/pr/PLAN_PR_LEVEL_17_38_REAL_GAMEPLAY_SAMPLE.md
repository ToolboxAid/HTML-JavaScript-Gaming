# PLAN_PR_LEVEL_17_38_REAL_GAMEPLAY_SAMPLE

## Purpose
Define a single real, playable Level 17 sample that proves existing 3D engine capability in one cohesive gameplay loop.

## Scope
- add one new sample under `samples/phase-17/1708/`
- integrate sample `1708` into `samples/index.html`
- use existing engine systems only (scene, input, camera, rendering, debug surfaces)
- implement a minimal but complete loop: movement, obstacle/enemy interaction, and objective/score state

## Source of Truth
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` (`## 17. 3D Activation, Validation, and Execution (Phase 16)`)
- existing Level 17 sample range `samples/phase-17/1701` through `samples/phase-17/1707`

## Functional Requirements
1. Player-controlled movement in a bounded 3D play space.
2. At least one interactive gameplay threat or obstacle.
3. Visible objective/score feedback and end-condition messaging.
4. Camera behavior that keeps gameplay readable (follow/chase/orbit mode using existing camera facilities).
5. Debug integration via existing debug panel/provider surfaces only (no new debug framework features).

## Out of Scope
- no engine-core feature additions
- no new generic debug-system features
- no extra Level 17 samples beyond `1708`
- no roadmap status updates in this PLAN step

## Validation Targets (for BUILD phase)
- sample `1708` launches from `samples/index.html` without console/runtime errors
- gameplay loop is playable start-to-finish
- debug panel integration renders using existing surfaces
- existing Level 17 sample links remain intact
