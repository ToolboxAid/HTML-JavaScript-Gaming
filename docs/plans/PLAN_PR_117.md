Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_117.md

# PLAN_PR — Sample117 - Mini-Map System

## Capability
Mini-Map System

## Goal
Add a reusable mini-map system so world position and nearby layout can be presented through approved renderer/camera paths.

## Engine Scope
- Add engine-owned mini-map presentation support
- Keep rendering inside approved renderer/camera ownership rules
- Allow reusable mapping of world/tile/entity positions into mini-map space

## Sample Scope
- Demonstrate a working mini-map in samples/Sample117/
- Show player/world position clearly on the mini-map
- Follow Sample01 structure exactly

## Acceptance Targets
- Mini-map clearly represents relevant world context
- Presentation support is reusable and engine-owned
- No renderer rule violations occur in sample code

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
