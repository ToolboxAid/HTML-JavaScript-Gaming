Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Gravity Well Validation Phase 3 (Determinism + Timing Stress)

## Purpose
Implement the final Gravity Well validation pass focused on deterministic repeatability and dt/timing sensitivity.

## Goal
Validate:
- replay repeatability from the same input script
- coarse-dt vs stepped-dt behavior within acceptable tolerance
- long-session drift risk
- win/loss consistency under timing variation

## Scope
- `games/GravityWell/game/GravityWellWorld.js`
- focused tests under `tests/games/`
- `tests/run-tests.mjs` only if required

## Constraints
- Prefer tests over runtime changes
- No engine changes
- No gameplay expansion
- No promotion/extraction work
- Any runtime fixes must be minimal and directly required by failing validation
- Use bounded tolerance for floating-point comparison where exact equality is unrealistic

## Expected Outcome
- deterministic behavior is proven or bounded
- timing sensitivity is measured and validated
- only minimal local hardening is allowed if validation exposes a real issue
