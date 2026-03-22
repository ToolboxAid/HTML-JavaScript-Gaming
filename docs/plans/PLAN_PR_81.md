Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_81.md

# PLAN_PR — Sample81 - Input Timing Windows

## Capability
Input Timing Windows

## Goal
Allow actions to be valid within configurable timing windows.

## Engine Scope
- Implement reusable logic in engine layer only
- No duplication in samples
- Follow input/renderer/camera/etc ownership rules

## Sample Scope
- Demonstrate capability in samples/Sample81/
- Follow Sample01 structure exactly
- No engine logic inside sample

## Acceptance Targets
- Capability clearly demonstrated
- Behavior is reusable
- No rule violations

## Out of Scope
- No game-layer logic
- No unrelated features
- No cross-sample coupling

## Build Notes
- Update samples/index.html
- Include required headers
- Maintain repo structure
