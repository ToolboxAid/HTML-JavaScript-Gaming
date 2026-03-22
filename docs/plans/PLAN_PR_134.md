Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_134.md

# PLAN_PR — Sample134 - Point-In-Polygon / Inside-Shape Collision

## Phase
8 - Graphics + Precision Collision

## Capability
Point-In-Polygon / Inside-Shape Collision

## Goal
Add reusable inside-shape collision support so points or small objects can be tested against the true interior of vector-defined shapes.

## Engine Scope
- Add engine-owned point-in-polygon and inside-shape collision support
- Keep interior testing reusable and decoupled from sample logic
- Allow use by projectiles, probes, or fine-grained collision checks

## Sample Scope
- Demonstrate a point or small object being tested against a shape interior in samples/Sample134/
- Show visible inside/outside proof
- Follow Sample01 structure exactly

## Acceptance Targets
- Inside-shape tests are visibly correct
- Interior testing remains engine-owned and reusable
- No duplicated shape-testing logic lives in sample files

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
