Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_161.md

# PLAN_PR — Sample161 - Entity Placement Editor

## Phase
11 - Editor Layer

## Capability
Entity Placement Editor

## Goal
Add reusable entity placement tooling so actors, items, triggers, and other world objects can be positioned visually.

## Engine Scope
- Add reusable entity placement tooling
- Support placement, movement, and persistence of editor-authored entities
- Keep placement logic separate from gameplay logic

## Sample Scope
- Demonstrate entity placement/editing in samples/Sample161/
- Show placement and movement of authored objects
- Follow Sample01 structure exactly

## Acceptance Targets
- Entity placement editing is clearly demonstrated
- Placement support remains reusable and tool-oriented
- Sample remains proof-only and rule-compliant

## Out of Scope
- No unrelated engine refactors beyond the approved capability
- No game-specific content assumptions
- No expansion beyond the approved sample purpose

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine, tooling, or repo-owned paths and proof logic in samples only
