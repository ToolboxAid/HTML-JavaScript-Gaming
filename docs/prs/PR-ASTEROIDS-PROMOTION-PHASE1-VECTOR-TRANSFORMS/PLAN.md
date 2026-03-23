Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Asteroids Promotion Phase 1: Vector Transforms

## Goal
Promote only the already-proven reusable vector/point transform behavior by replacing Asteroids-local transform helpers with existing `engine/vector` support.

## In Scope
- `games/Asteroids/` files that currently carry local vector/point transform helpers
- `engine/vector/` only if a minimal compatibility addition is strictly required
- focused tests affected by the promotion
- `tests/run-tests.mjs` only if required

## Out of Scope
- broad math cleanup
- state guard promotion
- persistence helper promotion
- HUD/menu/session extraction
- gameplay tuning changes
- unrelated engine abstractions

## Required Changes

### 1. Replace local transform duplication
Identify Asteroids-local vector/point transform helpers and replace them with existing `engine/vector` usage where the engine already provides the needed behavior.

Prefer:
- adoption
- narrow adapter use
- small compatibility glue only if strictly required

Avoid:
- creating a new generic math layer
- moving Asteroids-only gameplay math into engine

### 2. Preserve behavior
Preserve:
- ship rendering behavior
- debris/effect geometry behavior
- orientation/rotation behavior
- current gameplay feel and timing

### 3. Keep promotion narrow
Do not promote:
- HUD logic
- session logic
- score/menu/game-over rules
- one-off gameplay geometry policies

### 4. Tests / evidence
Add or update focused tests where practical to prove:
- transform behavior remains correct
- Asteroids-local duplication is removed without changing runtime behavior

## Acceptance Criteria
- Asteroids-local transform duplication is reduced or removed
- engine/vector is used where already justified
- no gameplay behavior changes
- no unrelated logic is promoted
