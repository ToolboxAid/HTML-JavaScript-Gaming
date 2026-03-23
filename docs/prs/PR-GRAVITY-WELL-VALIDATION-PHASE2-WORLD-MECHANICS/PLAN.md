Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Gravity Well Validation Phase 2: World Mechanics

## Goal
Add focused validation for Gravity Well world mechanics so thrust, gravity, interaction boundaries, and ordering behavior are proven before determinism/timing stress validation.

## In Scope
- `games/GravityWell/game/GravityWellWorld.js`
- focused tests under `tests/games/`
- `tests/run-tests.mjs` only if required

## Out of Scope
- boot/scene validation
- determinism/timing stress validation
- engine changes
- gameplay feature expansion
- promotion/extraction work
- visual polish

## Required Changes

### 1. Thrust and force interaction validation
Add focused tests for:
- thrust-only motion in the expected ship-forward direction
- gravity-only motion as a baseline
- thrust-plus-gravity combined acceleration
- brake damping while motion is active
- max-speed clamp behavior under repeated acceleration

### 2. Pickup and collection validation
Add focused tests for:
- exact pickup threshold behavior
- just-inside pickup boundary
- just-outside pickup boundary
- no double-count collection on repeated overlap
- final-beacon win transition correctness

### 3. Loss and ordering validation
Add focused tests for:
- planet-overlap loss
- out-of-bounds loss
- ordering behavior when a loss condition and beacon collection could occur in the same update
- explicit proof of the intended ordering semantics

### 4. Runtime changes policy
Only make runtime changes if:
- a focused validation test proves a real issue
- the fix is minimal
- the fix stays within `games/GravityWell/`

## Acceptance Criteria
- focused world-mechanics tests are present
- thrust/gravity/brake/clamp behavior is validated
- pickup boundaries and no-double-count behavior are validated
- loss ordering is explicit and tested
- any runtime fixes are minimal and directly tied to failing validation
- no engine/runtime redesign is introduced
