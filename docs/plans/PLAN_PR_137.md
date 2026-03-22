Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_137.md

# PLAN_PR — Sample137 - Hybrid Collision (Bounds -> Shape -> Pixel)

## Phase
8 - Graphics + Precision Collision

## Capability
Hybrid Collision (Bounds -> Shape -> Pixel)

## Goal
Introduce reusable hybrid collision flow so broad-phase and fine-phase collision checks can be combined efficiently for production-oriented accuracy.

## Engine Scope
- Add engine-owned staged collision support combining bounds, shape, and pixel checks
- Keep the collision pipeline reusable and configurable
- Preserve performance-minded ownership by separating broad and narrow phases

## Sample Scope
- Demonstrate staged collision flow in samples/Sample137/
- Show broad-phase followed by more accurate shape/pixel checks
- Follow Sample01 structure exactly

## Acceptance Targets
- Hybrid collision flow is clearly demonstrated
- Staged collision remains engine-owned and reusable
- Performance-minded structure is visible without sample hacks

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
