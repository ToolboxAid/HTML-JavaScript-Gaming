Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_80.md

# PLAN_PR — Sample80 - Input Queue + Priority

## Capability
Input Queue + Priority

## Goal
Extend buffering to support queued inputs and priority resolution.

## Engine Scope
- Implement reusable logic in engine layer only
- No duplication in samples
- Follow input/renderer/camera/etc ownership rules

## Sample Scope
- Demonstrate capability in samples/Sample80/
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
