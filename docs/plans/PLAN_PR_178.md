Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_178.md

# PLAN_PR — Sample178 - In-Engine Inspector

## Phase
15 - Developer Tooling

## Capability
In-Engine Inspector

## Goal
Introduce an inspector for viewing runtime entity/system state.

## Engine Scope
- Implement reusable tooling support in engine or tooling layer
- Keep tools decoupled from gameplay logic
- Ensure tools are optional and non-invasive

## Sample Scope
- Demonstrate capability in samples/Sample178/
- Follow Sample01 structure exactly
- No core logic embedded in sample

## Acceptance Targets
- Tool is clearly usable and visible
- Behavior is reusable across engine workflows
- No rule violations

## Out of Scope
- No game-specific tooling
- No unrelated features

## Build Notes
- Update samples/index.html
- Preserve repo structure
