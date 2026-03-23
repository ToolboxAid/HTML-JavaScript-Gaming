Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Gravity Well Validation Phase 3: Determinism + Timing Stress

## Goal
Add focused validation for Gravity Well deterministic repeatability and timing-condition stability so the game is proven under replay and dt stress before any hardening or promotion decisions.

## In Scope
- `games/GravityWell/game/GravityWellWorld.js`
- focused tests under `tests/games/`
- `tests/run-tests.mjs` only if required

## Out of Scope
- boot/scene validation
- world-mechanics validation already completed
- engine changes
- gameplay feature expansion
- promotion/extraction work
- visual polish

## Required Changes

### 1. Replay determinism validation
Add focused tests that run the same input sequence twice and compare resulting state with explicit tolerance where needed.

Compare at minimum:
- ship position
- ship velocity
- collected beacons / counters
- status outcome
- elapsed/basic progression state as applicable

### 2. dt sensitivity validation
Add focused comparison tests for:
- one large dt update vs equivalent many smaller fixed steps
- coarse-dt effect on win detection
- coarse-dt effect on loss/bounds detection
- acceptable tolerance thresholds for motion divergence

### 3. Long-session stability checks
Add tests or bounded simulations that check:
- no runaway accumulation in ordinary play conditions
- no obvious drift explosion over longer repeated updates
- speed clamp and world rules continue to hold over time

### 4. Runtime changes policy
Only make runtime changes if:
- a focused validation test proves a real issue
- the fix is minimal
- the fix stays within `games/GravityWell/`
- the fix is directly tied to timing/determinism stability

## Acceptance Criteria
- replay determinism tests are present
- dt sensitivity tests are present
- tolerance is explicit and justified where used
- any runtime fixes are minimal and directly tied to failing validation
- no engine/runtime redesign is introduced
