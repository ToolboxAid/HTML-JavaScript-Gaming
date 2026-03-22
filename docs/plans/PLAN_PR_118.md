Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_118.md

# PLAN_PR — Sample118 - Achievements System

## Capability
Achievements System

## Goal
Introduce a reusable achievements system so milestones can be tracked and surfaced without hardcoding game-specific unlock logic in scenes.

## Engine Scope
- Add engine-owned achievement tracking and unlock support
- Keep milestone definitions data-driven and reusable
- Avoid sample-specific achievement logic inside engine internals

## Sample Scope
- Demonstrate one or more achievements unlocking in samples/Sample118/
- Show visible proof of tracked milestones and unlock state
- Follow Sample01 structure exactly

## Acceptance Targets
- Achievements unlock correctly based on defined conditions
- Tracking logic is reusable and engine-owned
- Sample remains proof-only with no duplicated system logic

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
