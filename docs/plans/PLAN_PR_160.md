Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_160.md

# PLAN_PR — Sample160 - Tile / Map Editor

## Phase
11 - Editor Layer

## Capability
Tile / Map Editor

## Goal
Introduce reusable tile and map editing support for grid-based content creation and maintenance.

## Engine Scope
- Add reusable tile/map editing support
- Keep map editing data-driven and compatible with existing tile/world systems
- Avoid scene-specific editing hacks

## Sample Scope
- Demonstrate tile/map editing in samples/Sample160/
- Show visible editing and save/apply proof
- Follow Sample01 structure exactly

## Acceptance Targets
- Tile/map editing is clearly demonstrated
- Editing support remains reusable and compatible with engine systems
- No sample-only hacks define the core solution

## Out of Scope
- No unrelated engine refactors beyond the approved capability
- No game-specific content assumptions
- No expansion beyond the approved sample purpose

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine, tooling, or repo-owned paths and proof logic in samples only
