Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Boundary Cleanup Step 2A (Engine Time Composition)

## Purpose
Implement the first Step 2 follow-up from the approved static-global audit.

## Goal
Replace raw loop timing state inside `Engine` with composition over:
- `engine/core/FrameClock.js`
- `engine/core/FixedTicker.js`

## Scope
- `engine/core/Engine.js`
- `engine/core/FrameClock.js` (only if needed for safe Engine composition)
- `engine/core/FixedTicker.js` (only if needed for safe Engine composition)
- focused engine timing tests
- test runner updates only if required

## Constraints
- No gameplay changes
- No rendering changes
- No fullscreen work in this PR
- No CanvasSurface work in this PR
- Do not merge `FrameClock` and `FixedTicker`
- Preserve current update loop semantics

## Expected Outcome
- `Engine` stops owning raw loop timing bookkeeping directly
- `Engine` delegates timing to `FrameClock` and `FixedTicker`
- focused tests prove no behavior change in delta clamping and fixed-step catch-up
