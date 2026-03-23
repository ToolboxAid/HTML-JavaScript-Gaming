Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Gravity Well Promotion (Reusable Vector/Force Helpers, Single Step)

## Purpose
Perform one tightly scoped promotion pass to extract only the Gravity Well vector/force helpers that are clearly reusable.

## Goal
- identify already-proven generic vector/force helpers inside `games/GravityWell/`
- move only the clearly reusable portion into `engine/`
- keep gameplay policy, tuning, and game-specific rules local
- complete the promotion in one safe step

## Scope
- `games/GravityWell/`
- `engine/vector/` and/or another already-relevant engine utility area only if strictly justified
- focused tests affected by the promotion
- `tests/run-tests.mjs` only if required

## Constraints
- Single-step promotion only
- No engine redesign
- No gameplay changes
- No speculative abstraction
- No promotion of win/loss rules, level logic, UI, or game tuning
- Prefer adoption of existing engine/vector patterns over new subsystem creation

## Expected Outcome
- only clearly reusable vector/force helpers are promoted
- Gravity Well adopts the promoted engine helper(s)
- behavior remains unchanged
- promotion stays narrow, proven, and mechanical
