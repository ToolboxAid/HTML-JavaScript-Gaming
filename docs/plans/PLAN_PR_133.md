Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_133.md

# PLAN_PR — Sample133 - Polygon Collision

## Phase
8 - Graphics + Precision Collision

## Capability
Polygon Collision

## Goal
Introduce reusable polygon collision support so non-box shapes can collide more accurately through engine-owned collision paths.

## Engine Scope
- Add engine-owned polygon collision support
- Support reusable collision tests between polygon-based shapes
- Keep collision evaluation in engine systems rather than sample-owned helpers
- Allow future reuse by vector or shape-driven samples

## Sample Scope
- Demonstrate polygon-based collision in samples/Sample133/
- Show clear contrast against simpler bounds assumptions where useful
- Follow Sample01 structure exactly

## Acceptance Targets
- Polygon collision results are visibly correct
- Collision support is reusable and engine-owned
- No core collision logic is duplicated in sample files

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
