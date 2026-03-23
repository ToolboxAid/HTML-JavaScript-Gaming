Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Gravity Well Validation Phase 2 (World Mechanics)

## Purpose
Implement the second Gravity Well validation pass focused on world simulation correctness.

## Goal
Validate:
- thrust-only directionality
- thrust + gravity interaction
- brake damping behavior
- max-speed clamp behavior
- pickup boundary correctness
- collection/no-double-count behavior
- loss ordering where edge cases overlap

## Scope
- `games/GravityWell/game/GravityWellWorld.js`
- focused tests under `tests/games/`
- `tests/run-tests.mjs` only if required

## Constraints
- Prefer tests over runtime changes
- No engine changes
- No gameplay expansion
- No promotion/extraction work
- No timing stress work in this PR
- Any runtime fixes must be minimal and directly required by failing validation

## Expected Outcome
- Gravity Well world mechanics are proven in focused tests
- interaction ordering is explicit
- only minimal local fixes are allowed if validation exposes real issues
