# PLAN_PR: PR_26177_DELTA_053-random-shared-helpers

## Purpose

Create shared internal helper logic for random utility operations.

## Owner And Assignment

- Team: Delta
- OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_053-random-shared-helpers`.
- Ownership fit: Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Scope

- Add internal/shared helper functions for:
  - `nextInt(randomNext, min, max)`
  - `nextFloat(randomNext, min, max)`
  - `pick(randomNext, array)`
  - `shuffle(randomNext, array)`
  - `chance(randomNext, percent)`
  - `weightedPick(randomNext, weightedItems)`
- Helper functions must consume a `randomNext` function returning a float `>= 0` and `< 1`.
- Do not expose these helpers as Creator-facing API.
- Do not change existing `RandomSeed` behavior.
- Add targeted unit tests.

## Implementation Plan

1. Add `src/shared/math/randomHelpers.js`.
2. Add `tests/shared/RandomHelpers.test.mjs`.
3. Validate helper behavior and input guards with targeted unit tests.
4. Preserve current `RandomSeed` implementation and tests unchanged.
5. Produce required PR reports and repo-structured ZIP.

## Acceptance Criteria

- Helpers use only the supplied `randomNext` source.
- Integer, float, pick, shuffle, chance, and weighted pick operations are covered.
- Invalid `randomNext`, ranges, arrays, percentages, and weighted item inputs reject predictably.
- Existing `RandomSeed` behavior remains unchanged.
