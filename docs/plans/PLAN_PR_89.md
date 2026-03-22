Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_89.md

# PLAN_PR — Sample89 - Health + Death State

## Capability
Health + Death State

## Goal
Add reusable health tracking and a simple death/disabled state transition.

## Engine Scope
- Add reusable health state support in engine layer
- Keep death/disabled transitions data-driven
- Avoid game-layer persistence or progression logic

## Sample Scope
- Demonstrate health reduction to zero and transition to dead/disabled state
- Show clear visible state change
- Follow Sample01 structure exactly

## Acceptance Targets
- Health decreases predictably
- Zero health transitions into dead/disabled state
- Capability is reusable and sample remains proof-only

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
