Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_128.md

# PLAN_PR — Sample128 - Input Context System

## Phase
7 - Platform + UX

## Capability
Input Context System

## Goal
Add a reusable input context system so gameplay, UI, menu, and other control layers can switch cleanly without conflict.

## Engine Scope
- Add engine-owned context-aware input routing
- Keep context switching reusable and decoupled from sample hacks
- Preserve existing input abstraction rules

## Sample Scope
- Demonstrate switching between at least two input contexts in samples/Sample128/
- Show that actions resolve according to the active context
- Follow Sample01 structure exactly

## Acceptance Targets
- Input contexts switch predictably
- Routing remains engine-owned and reusable
- No raw input branching is duplicated in the sample

## Out of Scope
- No game-specific logic
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
