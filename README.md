Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Boundary Cleanup Step 1 (Adapter Seams)

## Purpose
Implement the first safe boundary cleanup based on audit results.

## Scope
- Remove renderer ctx leakage
- Add scheduler/time injection seams
- Guard browser globals
- Introduce tests/engine structure

## Constraints
- No gameplay changes
- No refactor beyond defined scope
- No prefab/release redesign
- Surgical changes only

## Expected Outcome
- Renderer boundary enforced
- Engine testable without browser
- tests/engine present and wired
