Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_99.md

# PLAN_PR — Sample99 - Chase/Evade AI

## Capability
Chase/Evade AI

## Goal
Introduce reusable chase and evade behaviors so entities can pursue or avoid another target using engine-owned logic.

## Engine Scope
- Add reusable chase/evade behavior support in engine-owned paths
- Keep target selection and movement response decoupled from scenes
- Allow behavior to work with existing movement/collision ownership rules

## Sample Scope
- Demonstrate one entity chasing and/or evading another
- Show clear behavior changes based on relative positions
- Follow Sample01 structure exactly

## Acceptance Targets
- Chase and evade responses are visibly correct
- Behavior support is reusable and engine-owned
- No duplicated AI logic lives in the sample scene

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
