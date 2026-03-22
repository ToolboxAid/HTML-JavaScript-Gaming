Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_86.md

# PLAN_PR — Sample86 - Attack Timing Windows

## Capability
Attack Timing Windows

## Goal
Add startup, active, and recovery timing windows for attacks so interactions can be timed cleanly.

## Engine Scope
- Implement reusable attack phase timing support
- Keep timing state separate from rendering and scene orchestration
- Allow data-driven duration values

## Sample Scope
- Demonstrate startup, active, and recovery phases clearly
- Use visible timing feedback for proof
- Follow Sample01 structure exactly

## Acceptance Targets
- Attack phases transition correctly
- Only active frames can register overlap results
- No rule violations across engine/sample boundaries

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
