Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Asteroids Promotion Phase 1 (Vector Transforms)

## Purpose
Execute the first controlled promotion pass now that engine cleanup, stabilization, and validation are complete.

## Goal
Replace Asteroids-local vector/point transform helpers with existing `engine/vector` capabilities where already proven reusable.

## Scope
- `games/Asteroids/`
- `engine/vector/`
- direct tests affected by the promotion
- `tests/run-tests.mjs` only if required

## Constraints
- No broad math refactor
- No gameplay changes
- No UI/HUD/session extraction
- No promotion of one-off game-feel logic
- Prefer adoption of existing engine utilities over creating new abstractions
- Keep schema/session/HUD rules local to Asteroids

## Expected Outcome
- Asteroids uses engine-owned vector transform helpers where appropriate
- duplicate local transform logic is reduced
- behavior remains unchanged
- promotion stays narrow and proven
