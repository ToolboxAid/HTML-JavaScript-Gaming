Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_LEVEL_8_1_SECOND_GAME_REUSE_VALIDATION.md

# PLAN_PR — Level 8.1 Second Game Reuse Validation

## Title
Level 8.1 — Second Game Reuse Validation (Space Invaders)

## Purpose
Validate that the Level 7 world systems and Level 8 implementation patterns generalize cleanly to a second classic arcade game.

## Scope
- docs/pr
- docs/dev

## Out of Scope
- engine/ redesign
- tool refactors
- system rewrites
- unrelated cleanup

## Second Game (Locked)
Space Invaders (Classic)

## Why Space Invaders
- Strong fit for world-state progression
- Strong fit for spawn scheduling and formation control
- Strong fit for timed/dynamic events
- Distinct gameplay loop from Asteroids, which makes reuse validation meaningful

## Reuse Goals
- Reuse Spawn System for wave/formation population
- Reuse Lifecycle System for cleanup, bounds, and entity limits
- Reuse World State System for rounds, escalation, and state transitions
- Reuse Events System for UFO passes, tempo changes, and special triggers

## Architecture Rules
- Scene orchestrates only
- Systems contain logic only
- No rendering in systems
- No input in systems
- No duplication of Level 7 systems
- Prefer config-driven setup over hardcoded behavior

## Build Direction
The future BUILD_PR should:
- implement a Space Invaders-style sample/game using existing Level 7 systems
- keep game-specific logic in the game/sample layer
- avoid pushing game-specific rules into engine
- prove reuse through composition, not copying

## Deliverables
- Space Invaders scene/game plan for execution
- system-to-game mapping
- config ownership rules
- scope guard against engine drift
- next-step BUILD guidance

## Acceptance Criteria
- second game uses the existing systems stack
- no engine architecture violations
- no duplicate world-system logic introduced
- game-specific rules remain local
- reuse value is clear and documented

## Next Step
BUILD_PR_LEVEL_8_1_SPACE_INVADERS_REUSE_VALIDATION
