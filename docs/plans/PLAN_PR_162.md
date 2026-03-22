Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_162.md

# PLAN_PR — Sample162 - Timeline / Cutscene Editor

## Phase
11 - Editor Layer

## Capability
Timeline / Cutscene Editor

## Goal
Introduce reusable timeline and cutscene editing support so scripted sequences can be authored without hardcoded scene logic.

## Engine Scope
- Add reusable timeline/cutscene editing support
- Support editable sequencing for scripted content
- Keep authoring tools separate from runtime scene hacks

## Sample Scope
- Demonstrate timeline/cutscene editing proof in samples/Sample162/
- Show authored sequence data being created or adjusted
- Follow Sample01 structure exactly

## Acceptance Targets
- Timeline/cutscene editing is clearly demonstrated
- Authoring support remains reusable and not scene-trapped
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
