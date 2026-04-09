Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_LEVEL_8_2_THIRD_GAME_PATTERN_EXPANSION.md

# PLAN_PR — Level 8.2 Third Game Pattern Expansion

## Title
Level 8.2 — Third Game Pattern Expansion (Pacman Lite)

## Purpose
Validate that the existing Level 7 world systems and Level 8 game integration pattern extend to a third arcade game with a materially different pacing and movement model.

## Scope
- docs/pr
- docs/dev

## Out of Scope
- src/engine/ redesign
- tool refactors
- system rewrites
- unrelated cleanup

## Third Game (Locked)
Pacman Lite

## Why Pacman Lite
- Distinct movement and pacing from Asteroids and Space Invaders
- Strong fit for state transitions, timed events, and lifecycle cleanup
- Useful stress test for reuse boundaries without requiring full Pacman feature parity

## Reuse Goals
- Reuse Spawn System for pellet/bonus/ghost population where appropriate
- Reuse Lifecycle System for cleanup, bounds, and inactive entity handling
- Reuse World State System for round progression, life/reset state, and completion flow
- Reuse Events System for frightened windows, bonus timing, and dynamic changes

## Architecture Rules
- Scene orchestrates only
- Systems contain logic only
- No rendering in systems
- No input in systems
- No duplication of Level 7 systems
- Prefer config-driven setup over hardcoded behavior

## Build Direction
The future BUILD_PR should:
- implement a Pacman Lite style sample/game using existing Level 7 systems
- keep maze/game-specific rules local to the game/sample layer
- avoid pushing Pacman-specific mechanics into engine
- prove reuse through composition and controlled adaptation

## Deliverables
- Pacman Lite scene/game plan for execution
- system-to-game mapping
- config ownership rules
- scope guard against engine drift
- next-step BUILD guidance

## Acceptance Criteria
- third game uses the existing systems stack where appropriate
- no engine architecture violations
- no duplicate world-system logic introduced
- Pacman-specific rules remain local
- reuse value is clear and documented

## Next Step
BUILD_PR_LEVEL_8_2_PACMAN_LITE_PATTERN_EXPANSION
