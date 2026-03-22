Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_85.md

# PLAN_PR — Sample85 - Hitboxes + Hurtboxes

## Capability
Hitboxes + Hurtboxes

## Goal
Introduce reusable overlap regions for attacks and damage reception without embedding combat logic in scenes.

## Engine Scope
- Add reusable hitbox/hurtbox data support in engine layer
- Keep collision/overlap evaluation reusable and data-driven
- Avoid sample-specific combat logic in engine contracts

## Sample Scope
- Demonstrate attack region overlapping a target region
- Show clear active vs inactive hit states
- Follow Sample01 structure exactly

## Acceptance Targets
- Hitbox/hurtbox overlap is visibly demonstrated
- Activation is data-driven, not hardcoded in scene branches
- No engine logic is duplicated in sample files

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
