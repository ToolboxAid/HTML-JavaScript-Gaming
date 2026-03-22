Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_135.md

# PLAN_PR — Sample135 - Raster Mask Collision

## Phase
8 - Graphics + Precision Collision

## Capability
Raster Mask Collision

## Goal
Introduce reusable raster mask collision support so occupied image regions can be tested more accurately than simple bounds checks.

## Engine Scope
- Add engine-owned raster mask generation or mask-usage support
- Keep mask evaluation reusable and separate from sample-specific hacks
- Allow image-driven occupancy testing through approved engine paths

## Sample Scope
- Demonstrate image or mask-based collision in samples/Sample135/
- Show a visible difference between bounds checks and mask-aware results
- Follow Sample01 structure exactly

## Acceptance Targets
- Mask-based collision behaves predictably
- Mask support is reusable and engine-owned
- No direct low-level collision implementation is duplicated in sample code

## Asteroids Relevance
- This capability supports accurate non-box collision and/or vector-style presentation useful for Asteroids-like gameplay.

## Out of Scope
- No game-specific asteroid implementation
- No unrelated renderer or collision refactors beyond the approved capability
- No expansion beyond the approved sample purpose

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
