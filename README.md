Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Gravity Well Validation Phase 1 (Boot + Scene)

## Purpose
Implement the first Gravity Well validation pass with focused proof around boot composition and scene flow.

## Goal
Validate:
- browser/test boot composition
- safe null-return paths
- scene installation/start behavior
- fullscreen click gating composition
- scene phase transitions at the top level

## Scope
- `games/GravityWell/main.js`
- `games/GravityWell/game/GravityWellScene.js`
- focused tests under `tests/games/` and/or `tests/engine/`
- `tests/run-tests.mjs` only if required

## Constraints
- Prefer tests over runtime changes
- No gameplay expansion
- No engine changes
- No promotion/extraction work
- Any runtime fixes must be minimal and directly required by failing validation

## Expected Outcome
- Gravity Well boot behavior is proven in browser-like and test-safe paths
- scene installation/start behavior is covered
- top-level scene flow is validated without broad runtime changes
