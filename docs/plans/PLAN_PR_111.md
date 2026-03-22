Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_111.md

# PLAN_PR — Sample111 - Resolution Scaling

## Capability
Resolution Scaling

## Goal
Add reusable resolution scaling support so rendering can adapt to different display sizes while preserving the engine rendering contract.

## Engine Scope
- Add engine-owned scaling support in approved renderer paths
- Preserve rendering ownership rules and avoid direct ctx leakage
- Allow data-driven or configurable scale behavior

## Sample Scope
- Demonstrate rendering at different scale/resolution configurations
- Show stable presentation quality across settings
- Follow Sample01 structure exactly

## Acceptance Targets
- Resolution scaling works predictably
- Scaling logic remains engine-owned and reusable
- No rendering rule violations occur in samples

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
