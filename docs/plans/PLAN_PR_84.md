Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_84.md

# PLAN_PR — Sample84 - Input State Debug Overlay

## Capability
Input State Debug Overlay

## Goal
Provide a debug visualization of input states and buffers.

## Engine Scope
- Implement reusable logic in engine layer only
- No duplication in samples
- Follow input/renderer/camera/etc ownership rules

## Sample Scope
- Demonstrate capability in samples/Sample84/
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
