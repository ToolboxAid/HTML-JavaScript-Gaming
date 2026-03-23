Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Boundary Cleanup Step 2A: Engine Time Composition

## Goal
Replace `Engine` raw timing bookkeeping with composed ownership of `FrameClock` and `FixedTicker` while preserving runtime behavior.

## In Scope
- `engine/core/Engine.js`
- `engine/core/FrameClock.js`
- `engine/core/FixedTicker.js`
- `tests/engine/` timing-focused coverage
- `tests/run-tests.mjs` only if required

## Out of Scope
- fullscreen cleanup
- canvas ownership cleanup
- event bus casing cleanup
- metrics composition polish beyond what this step directly needs
- gameplay tuning changes
- scene lifecycle redesign

## Required Changes

### 1. Engine timing composition
Refactor `Engine` so it no longer owns raw timing fields for:
- previous frame time bookkeeping
- accumulator bookkeeping
- fixed-step catch-up bookkeeping that should live in `FrameClock` / `FixedTicker`

`Engine` should instead compose with:
- `FrameClock` for frame delta / clamp handling
- `FixedTicker` for fixed-step accumulation and catch-up progression

### 2. Preserve current behavior
The implementation must preserve:
- current delta clamp behavior
- current fixed-step loop behavior
- current render/update ordering
- current runtime semantics for samples/games

### 3. Keep split ownership
Do **not** collapse `FrameClock` and `FixedTicker` back into a monolithic timer abstraction.

### 4. Test coverage
Add focused tests that prove:
- `Engine` uses composed timing primitives correctly
- delta clamping behavior remains stable
- fixed-step catch-up behavior remains stable
- custom time source / injection still works where supported

## Acceptance Criteria
- `Engine` no longer duplicates loop timing state that belongs in `FrameClock` / `FixedTicker`
- timing behavior remains unchanged
- tests cover engine-level timing composition
- no unrelated files are changed
