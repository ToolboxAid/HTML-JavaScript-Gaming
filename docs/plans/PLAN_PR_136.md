Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_136.md

# PLAN_PR — Sample136 - Pixel-Perfect Collision

## Phase
8 - Graphics + Precision Collision

## Capability
Pixel-Perfect Collision

## Goal
Add reusable pixel-perfect collision support so overlap can be evaluated at occupied-pixel accuracy for sprite or mask-based objects.

## Engine Scope
- Add engine-owned pixel-perfect collision support
- Allow fine-grained overlap checks through reusable collision paths
- Keep expensive checks controlled and decoupled from sample-specific logic

## Sample Scope
- Demonstrate pixel-perfect overlap in samples/Sample136/
- Show clearly why results differ from broad-phase checks
- Follow Sample01 structure exactly

## Acceptance Targets
- Pixel-perfect collision is visibly more precise than coarse checks
- Support remains engine-owned and reusable
- No pixel-level collision code is duplicated in sample files

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
