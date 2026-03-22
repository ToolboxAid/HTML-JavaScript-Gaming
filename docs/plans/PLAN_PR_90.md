Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_90.md

# PLAN_PR — Sample90 - Combat Debug Overlay

## Capability
Combat Debug Overlay

## Goal
Provide a reusable debug view for hitboxes, hurtboxes, timing states, health, and invulnerability.

## Engine Scope
- Add debug presentation support through approved renderer/debug paths only
- Keep overlay optional and non-invasive
- Expose reusable combat-state visibility for future samples

## Sample Scope
- Demonstrate debug rendering of combat state clearly
- Allow visual confirmation of timing and overlap behavior
- Follow Sample01 structure exactly

## Acceptance Targets
- Overlay clearly shows combat state data
- Debug view uses engine-owned presentation path
- Sample remains removable without breaking engine

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
