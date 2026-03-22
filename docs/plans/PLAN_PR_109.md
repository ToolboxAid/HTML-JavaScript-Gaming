Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_109.md

# PLAN_PR — Sample109 - Input Remapping

## Capability
Input Remapping

## Goal
Add reusable input remapping so bindings can be changed without hardcoded key assumptions in samples or engine consumers.

## Engine Scope
- Add engine-owned remapping support for input/action bindings
- Keep binding definitions data-driven and reusable
- Preserve input abstraction with no raw DOM assumptions in sample logic

## Sample Scope
- Demonstrate remapping an action to a different control
- Show remapped input working through normal engine contracts
- Follow Sample01 structure exactly

## Acceptance Targets
- Actions can be remapped cleanly
- Remapping is reusable and engine-owned
- No duplicated remapping logic exists in sample files

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
