Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_126.md

# PLAN_PR — Sample126 - Explosion / Particle FX

## Phase
7 - Platform + UX

## Capability
Explosion / Particle FX

## Goal
Add a reusable explosion and particle effects capability so short-lived visual effects can be triggered through engine-owned presentation paths.

## Engine Scope
- Add engine-owned particle/explosion effect support in approved renderer or effects paths
- Keep effect lifecycle and rendering reusable
- Avoid sample-specific one-off effect code becoming the core implementation

## Sample Scope
- Demonstrate explosion and/or particle effects in samples/Sample126/
- Show a clear trigger and visible effect lifecycle
- Follow Sample01 structure exactly

## Acceptance Targets
- Effect visuals are clearly demonstrated
- Lifecycle and rendering remain engine-owned and reusable
- No renderer rule violations occur in sample code

## Out of Scope
- No game-specific logic
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
