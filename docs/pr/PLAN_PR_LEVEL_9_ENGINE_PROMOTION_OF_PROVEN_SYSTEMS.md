Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_LEVEL_9_ENGINE_PROMOTION_OF_PROVEN_SYSTEMS.md

# PLAN_PR — Level 9 Engine Promotion of Proven Systems

## Title
Level 9 — Engine Promotion of Proven Systems

## Purpose
Promote the proven Level 7 world systems into engine-owned reusable subsystems now that they have been validated through:
- multiple game implementations
- distinct arcade patterns
- stress and edge-case testing

## Scope
- docs/pr
- docs/dev

## Out of Scope
- direct runtime code changes in this PLAN
- unrelated engine cleanup
- tool refactors
- new gameplay features

## Promotion Candidates (Locked)
The future BUILD_PR must evaluate and promote only the proven systems:
- Spawn System
- Lifecycle System
- World State System
- Events System

## Why This Step Exists
These systems are no longer sample-local experiments.
They are now:
- reused across Asteroids, Space Invaders, and Pacman Lite
- validated under different movement, pacing, and progression models
- stress-tested under edge-case conditions

That crosses the threshold for engine ownership under the repo rules.

## Promotion Rules
A system can move to engine only if all are true:
- proven across multiple games
- no rendering logic
- no input logic
- no game-specific rules embedded
- deterministic behavior preserved
- engine placement is domain-correct

## Engine Ownership Goals
The future BUILD_PR should:
- move proven system logic into appropriate engine domains
- preserve public contracts and behavior
- keep game-specific configuration in sample/game layer
- avoid generic dumping-ground modules
- document before/after ownership clearly

## Architectural Constraints
- Scene orchestrates only
- Systems contain logic only
- No rendering in systems
- No input in systems
- Engine owns reusable logic
- Game/sample layer owns game rules and config

## Build Direction
The future BUILD_PR should:
1. Inventory each candidate system
2. Identify engine placement
3. Move only reusable logic
4. Leave game-specific adapters/config local
5. Update imports and ownership references cleanly
6. Produce repo-structured documentation and ZIP

## Deliverables
- engine promotion plan for the four proven systems
- system-to-engine-domain mapping
- ownership before/after table
- migration risk list
- scope guard against architecture drift
- next-step BUILD guidance

## Acceptance Criteria
- promotion candidates are justified by proof of reuse
- no architecture violations are introduced
- no duplicate system logic remains in samples/games
- game-specific logic stays local
- engine ownership boundaries are explicit
- migration path is clear and controlled

## Next Step
BUILD_PR_LEVEL_9_ENGINE_PROMOTION_OF_PROVEN_SYSTEMS
