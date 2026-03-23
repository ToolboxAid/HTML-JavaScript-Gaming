Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN PR - Gravity Well Validation Phase 1

## Goal
Audit `games/GravityWell/` for boot correctness, thrust-plus-gravity interaction, win-zone detection, deterministic repeatability, and timing-condition stability, then define the smallest safe BUILD_PR ladder to harden and validate the game without changing runtime behavior in this docs pass.

## Scope
- `games/GravityWell/main.js`
- `games/GravityWell/game/GravityWellScene.js`
- `games/GravityWell/game/GravityWellWorld.js`
- `tests/games/GravityWell.test.mjs`
- `tests/run-tests.mjs`

## Out Of Scope
- Runtime source changes in this PR
- Engine changes
- New gameplay features or content expansion
- Promotion or extraction work
- Visual polish not tied to validation

## Current Module Map

### Boot
- `games/GravityWell/main.js:14-59`
- `bootGravityWell()` supports injected `documentRef`, `EngineClass`, `InputServiceClass`, and `SceneClass`.
- It safely returns `null` when there is no document or no `#game` canvas.
- It applies theme only for the real browser document.
- It wires click-to-fullscreen after `engine.start()`.

### Scene flow
- `games/GravityWell/game/GravityWellScene.js:25-215`
- Scene phases are `menu`, `playing`, `won`, and `lost`.
- `enter()` and `exit()` only manage canvas cursor state.
- `update()` gates run start/restart on `Enter`.
- `render()` owns all visual output, HUD, and overlays.

### World simulation
- `games/GravityWell/game/GravityWellWorld.js:78-246`
- `reset()` creates deterministic starting state from fixed constants.
- `update()` applies rotation, gravity, thrust, brake damping, speed clamp, movement integration, trail update, collision, bounds failure, beacon collection, and win transition.
- There is no RNG in world state updates.

### Current tests
- `tests/games/GravityWell.test.mjs:19-68`
- Existing proof is narrow:
  - gravity pulls a parked ship closer to a planet
  - a direct beacon overlap collects
  - a direct planet overlap loses
  - the last beacon can trigger `won`
- No boot test exists.
- No scene-flow test exists.
- No replay determinism test exists.
- No dt stress or timing comparison test exists.

## Findings By Validation Target

### 1. Boot correctness
Status: REVIEW_REQUIRED

What is already true:
- `main.js:20-30` is resilient to missing browser objects and missing canvas.
- `main.js:33-54` composes `Engine`, input, scene, and fullscreen cleanly.

Missing proof:
- No test verifies `bootGravityWell()` returns `null` without `documentRef`.
- No test verifies missing `#game` canvas is safe.
- No test verifies the theme is only applied for the real document path.
- No test verifies fullscreen click handling composes safely with injected engine/fullscreen doubles.
- No test verifies the created scene is actually installed and engine start is invoked once.

Recommended validation:
- Add focused boot tests with injected `documentRef`, `EngineClass`, and `InputServiceClass`.
- Cover browser-ready boot, no-document boot, missing-canvas boot, and click-to-fullscreen gating.

### 2. Thrust + gravity interaction
Status: REVIEW_REQUIRED

What is already true:
- `GravityWellWorld.js:117-134` combines gravity acceleration and thrust acceleration in the same frame.
- `GravityWellWorld.js:140-151` applies braking and speed clamp after acceleration.

Missing proof:
- Current tests only validate gravity without thrust.
- No test proves thrust changes velocity in the ship-forward direction while gravity is active.
- No test proves brake damping behaves safely under simultaneous gravity.
- No test proves `MAX_SPEED` clamp holds during combined thrust-plus-gravity acceleration.

Risk:
- Control feel can drift unnoticed because the current proof only covers one force component.
- Regression risk is highest around acceleration ordering and clamp application.

Recommended validation:
- Add world tests for:
  - thrust-only directionality
  - gravity-plus-thrust combined acceleration
  - brake damping under motion
  - speed clamp under repeated acceleration

### 3. Win-zone detection
Status: REVIEW_REQUIRED

What is already true:
- `GravityWellWorld.js:170-188` collects a beacon when ship and beacon radii overlap within the configured threshold and marks `won` when `remainingBeacons === 0`.
- Current tests prove a direct overlap collects and a pre-staged final beacon completes the run.

Missing proof:
- No boundary test around the exact pickup threshold at `ship.radius + beacon.radius + 2`.
- No negative test just outside the pickup boundary.
- No test proves `collectedCount` cannot increment twice on repeated overlap.
- No test proves loss ordering versus collection when a ship is simultaneously near a beacon and a planet or boundary.

Risk:
- Collection rules are currently correct in obvious cases, but edge conditions are unproven.
- Because loss checks run before beacon collection at `GravityWellWorld.js:158-180`, ambiguous edge cases should be validated explicitly.

Recommended validation:
- Add win-zone boundary and no-double-count tests.
- Add explicit ordering tests for loss-before-collect and collect-before-win expectations.

### 4. Deterministic repeatability
Status: NEEDS_PROOF

What is already true:
- `GravityWellWorld.js:24-41` and `:43-76` use fixed constants and pure helper math.
- `reset()` restores deterministic initial state.
- World update has no random source.
- Scene stars are deterministic from index math in `GravityWellScene.js:16-23`.

Missing proof:
- No test runs the same input script twice and compares resulting world state.
- No test proves `reset()` followed by the same input sequence yields the same ship, beacon, and status outcome.
- No test proves scene-level `startRun()` restores world state exactly.

Risk:
- The game appears deterministic by inspection, but there is no regression guardrail.
- Future additions could introduce hidden randomness or state leakage without being caught.

Recommended validation:
- Add replay tests that run a fixed input sequence twice and compare:
  - ship position/velocity
  - collected beacons
  - elapsed time
  - status message and phase where relevant

### 5. Timing-condition stability
Status: HIGH_RISK_REVIEW_REQUIRED

What is already true:
- Gravity Well currently uses the engine fixed-step clock at boot via `main.js:34-39`.
- World update accepts `dtSeconds` directly and integrates the whole interval in one pass.

Missing proof:
- No stress test compares one large `dt` update with equivalent smaller fixed steps.
- No test covers long-frame or catch-up conditions.
- No test proves collision or win behavior remains stable under coarse dt.

Risk:
- `GravityWellWorld.js:115-156` uses straightforward Euler-style integration with no local substepping or dt cap.
- That is acceptable for a simple game, but it is specifically vulnerable to frame-sized behavior drift under large dt.
- This is the highest-likelihood hardening area if validation expands beyond happy-path dt.

Recommended validation:
- Add timing comparison tests:
  - one large dt vs many fixed 1/60 steps for the same elapsed time
  - win detection under coarse dt
  - loss/bounds stability under coarse dt
- Only harden runtime if those tests show user-visible divergence beyond acceptable tolerance.

## Risk Rank
1. Timing-condition stability
2. Thrust + gravity interaction
3. Win-zone boundary correctness
4. Boot correctness
5. Deterministic repeatability

## Small BUILD_PR Ladder

### BUILD_PR 1 - Gravity Well Boot And Scene Validation
Scope:
- Add focused tests for `bootGravityWell()`
- Validate scene installation, engine start, safe null return paths, and fullscreen click gating

Why first:
- Lowest-risk validation layer
- Gives immediate confidence that the game boots cleanly in browser and test environments

### BUILD_PR 2 - Gravity Well World Mechanics Validation
Scope:
- Add focused world tests for thrust-plus-gravity interaction, braking, clamp behavior, pickup boundaries, and no-double-count collection

Why second:
- Validates the core loop before timing stress complicates the signal

### BUILD_PR 3 - Gravity Well Determinism And Timing Stress
Scope:
- Add replay-equality tests
- Add coarse-dt vs stepped-dt comparison tests
- Apply minimal runtime hardening only if validation fails materially

Why third:
- This is the most likely place a runtime fix could become necessary
- The tests should land before any timing behavior changes

### BUILD_PR 4 - Gravity Well Hardening Cleanup
Scope:
- Only if prior tests expose real issues
- Small runtime fixes for dt handling, ordering edges, or boot composition gaps
- Keep changes limited to `games/GravityWell/`

Why last:
- Ensures hardening is driven by failing proof, not speculation

## Acceptance Criteria
- Exact validation targets are mapped to current files and flows.
- Current proof versus missing proof is documented for each target area.
- Timing sensitivity is identified as the top likely hardening candidate.
- A small BUILD_PR ladder is proposed in dependency order.
- This PR remains docs-only with no runtime source changes.
