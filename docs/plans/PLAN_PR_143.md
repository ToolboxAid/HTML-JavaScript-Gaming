Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_143.md

# PLAN_PR — Sample143 - Deployment Profiles

## Phase
9 - Final Polish + Deployment

## Capability
Deployment Profiles

## Goal
Add reusable deployment profile support so debug, development, demo, and production builds can be configured cleanly without sample-specific branching.

## Engine Scope
- Implement reusable support in engine-owned or repo-owned paths as appropriate
- Keep behavior configurable and reusable
- Avoid sample-specific hacks becoming the architecture
- Preserve current ownership boundaries and lifecycle rules

## Sample Scope
- Demonstrate capability in samples/Sample143/ where applicable
- Follow Sample01 structure exactly
- Keep samples proof-only with no reusable core logic embedded in scene files

## Acceptance Targets
- Capability is clearly demonstrated or validated
- Behavior is reusable across future samples and eventual games
- No rule violations across engine, samples, or repo structure
- Output remains consistent with the existing planning and build workflow

## Out of Scope
- No unrelated feature expansion
- No game-specific implementation details
- No bypassing engine ownership rules
- No unapproved restructuring beyond the capability scope

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
