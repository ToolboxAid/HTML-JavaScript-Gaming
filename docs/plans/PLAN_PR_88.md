Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_88.md

# PLAN_PR — Sample88 - Knockback Response

## Capability
Knockback Response

## Goal
Introduce reusable knockback motion when damage is received.

## Engine Scope
- Add reusable knockback response support
- Keep force/response logic data-driven and engine-owned
- Integrate with existing movement/collision rules without scene hacks

## Sample Scope
- Demonstrate a target being pushed back on hit
- Show stable response against world boundaries if applicable
- Follow Sample01 structure exactly

## Acceptance Targets
- Knockback is visible and directionally correct
- Response does not break movement ownership rules
- No duplicated reusable logic in samples

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
