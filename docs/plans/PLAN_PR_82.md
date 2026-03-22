Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_82.md

# PLAN_PR — Sample82 - Action Cooldowns

## Capability
Action Cooldowns

## Goal
Introduce cooldown timers preventing immediate re-trigger.

## Engine Scope
- Implement reusable logic in engine layer only
- No duplication in samples
- Follow input/renderer/camera/etc ownership rules

## Sample Scope
- Demonstrate capability in samples/Sample82/
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
