# PLAN_PR: PR_26177_DELTA_052-random-seed-utility

## Purpose

Add a reusable shared JavaScript `RandomSeed` utility for deterministic seeded random sequences.

## Owner And Assignment

- Team: Delta
- OWNER override approved: Assign Team Delta `PR_26177_DELTA_052-random-seed-utility`.
- Ownership fit: Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Scope

- Add a shared JavaScript utility class named `RandomSeed`.
- Constructor accepts an initial seed.
- Include:
  - `seed(value)`
  - `next()`
  - `nextInt(min, max)`
  - `nextFloat(min, max)`
  - `pick(array)`
- Add JSDoc for the utility and public methods.
- Add targeted unit tests.
- Do not replace existing `Math.random()` usage.
- No UI changes.
- No browser storage.
- No API/database changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/math/RandomSeed.js`.
2. Add `tests/shared/RandomSeed.test.mjs`.
3. Validate deterministic reseeding, different-seed divergence, numeric ranges, and array picking.
4. Run targeted unit tests for `RandomSeed`.
5. Run changed-file syntax checks for the new JS and test files.
6. Produce required reports and repo-structured ZIP.

## Acceptance Criteria

- Same seed reproduces the same sequence after reseeding.
- Different seeds produce different sequences.
- `next()` returns deterministic normalized values.
- `nextInt(min, max)` returns deterministic inclusive integers inside range.
- `nextFloat(min, max)` returns deterministic floats inside range.
- `pick(array)` returns deterministic values from the provided array.
- Existing `Math.random()` usage remains unchanged.
