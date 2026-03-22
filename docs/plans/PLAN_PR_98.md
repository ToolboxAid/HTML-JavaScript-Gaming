Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_98.md

# PLAN_PR — Sample98 - Patrol AI

## Capability
Patrol AI

## Goal
Add reusable patrol behavior so an entity can move across predefined points or routes using engine-owned AI support.

## Engine Scope
- Add reusable patrol behavior support in engine-owned paths
- Keep patrol data separate from scene orchestration
- Allow patrol routes to be data-driven rather than hardcoded branches

## Sample Scope
- Demonstrate an entity patrolling between points or along a route
- Show stable repeatable patrol behavior
- Follow Sample01 structure exactly

## Acceptance Targets
- Patrol route behavior is clearly demonstrated
- Logic is reusable and not trapped in sample files
- No direct rule violations across engine/sample boundaries

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
