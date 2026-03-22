Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_110.md

# PLAN_PR — Sample110 - Controller Support

## Capability
Controller Support

## Goal
Introduce reusable controller/gamepad support through engine-owned input contracts without bypassing the existing input abstraction.

## Engine Scope
- Add engine-owned controller input support
- Map controller input through existing action/input abstraction paths
- Keep controller-specific handling isolated from sample scenes

## Sample Scope
- Demonstrate sample input working from controller support
- Show action parity between keyboard and controller where appropriate
- Follow Sample01 structure exactly

## Acceptance Targets
- Controller input is recognized through engine-owned paths
- Actions work through the same abstracted contracts
- No sample-level controller hacks are required

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
