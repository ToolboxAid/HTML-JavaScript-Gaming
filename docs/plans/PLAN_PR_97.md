Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_97.md

# PLAN_PR — Sample97 - Pathfinding (Grid A*)

## Capability
Pathfinding (Grid A*)

## Goal
Introduce reusable grid-based A* pathfinding so entities can compute valid routes across tile-based spaces without scene-owned navigation hacks.

## Engine Scope
- Add reusable grid/pathfinding support in engine-owned paths
- Keep path calculation data-driven and decoupled from sample-specific AI
- Integrate cleanly with tile/grid data without bypassing engine ownership rules

## Sample Scope
- Demonstrate an entity finding a route across a blocked grid
- Show clear path result from start to goal
- Follow Sample01 structure exactly

## Acceptance Targets
- A* produces a valid path on a grid with obstacles
- Pathfinding logic is reusable and engine-owned
- No navigation logic is duplicated inside sample scene code

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
