Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_100.md

# PLAN_PR — Sample100 - State-Driven AI

## Capability
State-Driven AI

## Goal
Add reusable state-driven AI orchestration so entities can switch behaviors like idle, patrol, chase, or evade through structured state control.

## Engine Scope
- Build on engine-owned state support to drive AI behavior transitions
- Keep state logic reusable and not embedded in scene branches
- Allow behavior switching through clear, data-driven conditions

## Sample Scope
- Demonstrate an entity changing AI behavior based on runtime conditions
- Show visible state transitions and outcomes
- Follow Sample01 structure exactly

## Acceptance Targets
- AI changes state predictably and clearly
- Core orchestration is reusable and engine-owned
- Sample remains proof-only and free of duplicated framework logic

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
