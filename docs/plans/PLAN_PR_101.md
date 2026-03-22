Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_101.md

# PLAN_PR — Sample101 - Group Behaviors

## Capability
Group Behaviors

## Goal
Introduce reusable group behavior support so multiple entities can coordinate movement tendencies without hardcoded scene-to-scene wiring.

## Engine Scope
- Add reusable support for coordinated group movement/behavior patterns
- Keep group coordination generic and engine-owned
- Avoid sample-specific coupling between individual entities

## Sample Scope
- Demonstrate multiple entities exhibiting coordinated group behavior
- Show visible relation between members of the group
- Follow Sample01 structure exactly

## Acceptance Targets
- Group behavior is clearly visible and coherent
- Coordination support is reusable and engine-owned
- Sample remains removable without breaking engine behavior ownership

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
