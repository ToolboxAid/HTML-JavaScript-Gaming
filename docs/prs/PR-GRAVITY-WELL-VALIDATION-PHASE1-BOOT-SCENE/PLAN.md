Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Gravity Well Validation Phase 1: Boot + Scene

## Goal
Add focused validation for Gravity Well boot composition and top-level scene flow so the game is proven to install, start, and transition safely before deeper world/timing validation.

## In Scope
- `games/GravityWell/main.js`
- `games/GravityWell/game/GravityWellScene.js`
- focused tests under `tests/games/` and/or `tests/engine/`
- `tests/run-tests.mjs` only if required

## Out of Scope
- world mechanics validation
- determinism/timing stress validation
- engine changes
- gameplay feature expansion
- promotion/extraction work
- visual polish

## Required Changes

### 1. Boot validation
Add focused tests for `bootGravityWell()` covering:
- safe `null` return when `documentRef` is absent
- safe `null` return when `#game` canvas is absent
- engine creation/install/start when boot succeeds
- scene installation correctness
- input/theme/fullscreen composition as currently intended

### 2. Fullscreen click gating validation
Validate that click-to-fullscreen composition is wired safely and does not require real browser fullscreen support in tests.

Use doubles/mocks where appropriate.
Do not broaden the fullscreen system.

### 3. Scene flow validation
Add focused tests for top-level scene behavior, including:
- initial phase/state after construction or enter
- menu -> playing transition on expected input
- won/lost -> restart path on expected input
- no obvious top-level phase leakage across restart

Keep the scope at the scene/controller level, not deep world mechanics.

### 4. Runtime changes policy
Only make runtime changes if:
- a focused validation test proves a real issue
- the fix is minimal
- the fix stays within `games/GravityWell/`

## Acceptance Criteria
- Gravity Well boot behavior is covered by focused tests
- safe no-document/no-canvas paths are covered
- scene install/start behavior is covered
- top-level scene phase transitions are validated
- any runtime fixes are minimal and directly tied to failing validation
- no engine/runtime redesign is introduced
